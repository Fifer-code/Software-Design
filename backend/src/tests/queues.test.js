const request = require("supertest");
const express = require("express");
const serviceRoutes = require("../routes/serviceRoutes");
const queueRoutes = require("../routes/queueRoutes");

const app = express();
app.use(express.json());
app.use("/api/services", serviceRoutes);
app.use("/api/queues", queueRoutes);

describe("Queue API", () => {
  test("Join queue successfully", async () => {
    await request(app)
      .post("/api/services")
      .send({
        id: "dmv",
        name: "DMV Queue 1",
        description: "Standard DMV services",
        duration: 15,
        priority: "Low",
      });

    const serviceId = "dmv";

    const res = await request(app)
      .post(`/api/queues/${serviceId}/join`)
      .send({
        name: "Steven",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Steven");
    expect(res.body.serviceId).toBe(serviceId);
    expect(res.body.ticketId).toBeDefined();
  });

  test("Join queue missing fields should fail", async () => {
    const serviceId = "dmv";

    const res = await request(app)
      .post(`/api/queues/${serviceId}/join`)
      .send({
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid name");
  });

  test("Get queues by service", async () => {
    const serviceId = "dmv";

    await request(app)
      .post(`/api/queues/${serviceId}/join`)
      .send({
        name: "TestUser",
      });

    const res = await request(app).get("/api/queues");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("queues");

    const queuesForService = res.body.queues[serviceId] || [];
    expect(Array.isArray(queuesForService)).toBe(true);
    expect(queuesForService.length).toBeGreaterThan(0);
    expect(queuesForService[queuesForService.length - 1].name).toBe("TestUser");
  });

  test("Leave queue", async () => {
    const serviceId = "dmv";

    const join = await request(app)
      .post(`/api/queues/${serviceId}/join`)
      .send({
        name: "TestUser",
      });

    expect(join.statusCode).toBe(200);

    const ticketId = join.body.ticketId;

    const res = await request(app).delete(
      `/api/queues/${serviceId}/${ticketId}`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User removed");
  });

  test("Leave queue with invalid id", async () => {
    const res = await request(app).delete(`/api/queues/dmv/ZZZ999`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // --- TESTS FOR SERVING NEXT USER ---
  test("Serve next user successfully", async () => {
    // Setup: Join the queue first so someone is in line
    await request(app).post("/api/queues/dmv/join").send({ name: "Alice" });

    // Action: Hit the serve endpoint using the POST method from your routes
    const res = await request(app).post("/api/queues/dmv/serve");
    
    expect(res.statusCode).toBe(200);
  });

  test("Serve next user should fail if queue is empty", async () => {
    // Action: Hit the serve endpoint on a queue that we know is empty
    const res = await request(app).post("/api/queues/placeholder/serve");
    
    // Expecting the controller to catch the empty queue
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Queue is already empty");
  });

  test("Serve next user should return 404 for invalid service", async () => {
    // Action: Send a POST request to a service ID that doesn't exist in the config
    const res = await request(app).post("/api/queues/fake-service/serve");
    
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Service queue not found");
  });

  // --- TESTS FOR MOVING/REORDERING USERS ---
  test("Move user up in the queue", async () => {
    // Setup: Add two users to ensure we have someone to move up
    await request(app).post("/api/queues/dmv/join").send({ name: "Person 1" });
    const joinRes = await request(app).post("/api/queues/dmv/join").send({ name: "Person 2" });
    const ticketId = joinRes.body.ticketId;

    // Action: Hit the move endpoint using PATCH as defined in your routes
    const res = await request(app)
      .patch(`/api/queues/dmv/${ticketId}/move`)
      .send({ direction: "up" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Queue reordered");
  });

  test("Move user should fail if user not found", async () => {
    // Action: Try to move a ticket ID that is completely made up
    const res = await request(app)
      .patch("/api/queues/dmv/FAKE999/move")
      .send({ direction: "down" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
});
