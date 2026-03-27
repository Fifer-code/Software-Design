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
    // 1. First, make sure someone is in the queue
    await request(app).post("/api/queues/dmv/join").send({ name: "Alice" });

    // 2. Hit the serve endpoint
    const res = await request(app).post("/api/queues/dmv/serve");
    
    expect(res.statusCode).toBe(200);
    // Assuming your controller returns some success message
  });

  test("Serve next user should fail if queue is empty", async () => {
    // 1. Reset or ensure queue is empty (assuming a clean slate or resetting)
    // 2. Hit the serve endpoint on an empty queue
    const res = await request(app).post("/api/queues/placeholder/serve");
    
    // This hits the "Queue is already empty" error on line 72
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Queue is already empty");
  });

  test("Serve next user should return 404 for invalid service", async () => {
    const res = await request(app).post("/api/queues/fake-service/serve");
    
    // This hits the "Service queue not found" error on line 67
    expect(res.statusCode).toBe(404);
  });

  // --- TESTS FOR MOVING/REORDERING USERS ---
  test("Move user up in the queue", async () => {
    // 1. Add two users
    await request(app).post("/api/queues/dmv/join").send({ name: "Person 1" });
    const joinRes = await request(app).post("/api/queues/dmv/join").send({ name: "Person 2" });
    const ticketId = joinRes.body.ticketId;

    // 2. Move the second user UP
    const res = await request(app)
      .put(`/api/queues/dmv/${ticketId}/move`)
      .send({ direction: "up" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Queue reordered");
  });

  test("Move user should fail if user not found", async () => {
    const res = await request(app)
      .put("/api/queues/dmv/FAKE999/move")
      .send({ direction: "down" });

    // This hits the "User not found" error on line 109
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
});
