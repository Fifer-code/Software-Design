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
});
