const request = require("supertest");
const express = require("express");
const serviceRoutes = require("../routes/serviceRoutes");
const queueRoutes = require("../routes/queueRoutes");

jest.mock("../models/service");
jest.mock("../models/queue");
jest.mock("../models/queueEntry");

jest.mock("../controllers/notificationController", () => ({
  triggerJoinNotification: jest.fn(),
  triggerNearFrontNotification: jest.fn()
}));
jest.mock("../controllers/historyController", () => ({
  recordJoin: jest.fn(),
  recordServed: jest.fn(),
  recordRemoved: jest.fn()
}));

const Service = require("../models/service");
const Queue = require("../models/queue");
const QueueEntry = require("../models/queueEntry");

const app = express();
app.use(express.json());
app.use("/api/services", serviceRoutes);
app.use("/api/queues", queueRoutes);

beforeEach(() => {
  jest.clearAllMocks();
  // most tests need a valid service and open queue, set as default
  Service.findOne.mockResolvedValue({ serviceId: "dmv", name: "DMV Queue 1", duration: 15 });
  Queue.findOne.mockResolvedValue({ serviceId: "dmv", status: "open" });
});

describe("Queue API", () => {
  test("Join queue successfully", async () => {
    QueueEntry.countDocuments.mockResolvedValue(0);
    QueueEntry.create.mockResolvedValue({ ticketId: "D001", name: "Steven", status: "waiting" });

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
    expect(QueueEntry.create).toHaveBeenCalled();
  });

  test("Join queue missing fields should fail", async () => {
    const serviceId = "dmv";

    const res = await request(app)
      .post(`/api/queues/${serviceId}/join`)
      .send({
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid name");
    expect(QueueEntry.create).not.toHaveBeenCalled();
  });

  test("Get queues by service", async () => {
    const serviceId = "dmv";

    QueueEntry.countDocuments.mockResolvedValue(0);
    QueueEntry.create.mockResolvedValue({ ticketId: "D001", name: "TestUser", status: "waiting" });
    QueueEntry.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { queueId: "dmv", ticketId: "D001", name: "TestUser" }
      ])
    });

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

    QueueEntry.countDocuments.mockResolvedValue(0);
    QueueEntry.create.mockResolvedValue({ ticketId: "D001", name: "TestUser", status: "waiting" });
    QueueEntry.findOneAndUpdate.mockResolvedValue({ ticketId: "D001", name: "TestUser" });

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

  // Gemini Fix: Extra tests generated to expand on existing tests
  // --- TESTS FOR SERVING NEXT USER ---
  test("Serve next user successfully", async () => {
    // Setup: Join the queue first so someone is in line
    QueueEntry.countDocuments.mockResolvedValue(0);
    QueueEntry.create.mockResolvedValue({ ticketId: "D001", name: "Alice", status: "waiting" });
    QueueEntry.findOneAndUpdate.mockResolvedValue({ ticketId: "D001", name: "Alice", status: "waiting" });
    QueueEntry.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    await request(app).post("/api/queues/dmv/join").send({ name: "Alice" });

    // Action: Hit the serve endpoint using the POST method from your routes
    const res = await request(app).post("/api/queues/dmv/serve");

    expect(res.statusCode).toBe(200);
  });

  test("Serve next user should fail if queue is empty", async () => {
    // 1. Create a temporary service
    Service.create.mockResolvedValue({ serviceId: "emptyTest", name: "Empty", duration: 5, priority: "Low" });
    Queue.create.mockResolvedValue({});
    QueueEntry.countDocuments.mockResolvedValue(0);
    QueueEntry.create.mockResolvedValue({ ticketId: "E001", name: "Ghost User", status: "waiting" });
    // first serve returns an entry, second serve returns null (empty queue)
    QueueEntry.findOneAndUpdate
      .mockResolvedValueOnce({ ticketId: "E001", name: "Ghost User", status: "waiting" })
      .mockResolvedValueOnce(null);
    QueueEntry.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    await request(app).post("/api/services").send({
      id: "emptyTest", name: "Empty", description: "Test", duration: 5, priority: "Low"
    });

    await request(app).post("/api/queues/emptyTest/join").send({ name: "Ghost User" });

    await request(app).post("/api/queues/emptyTest/serve");

    // 4. Action: Try to serve AGAIN. This will now hit the 400 error!
    const res = await request(app).post("/api/queues/emptyTest/serve");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Queue is already empty");
  });

  test("Serve next user should return 404 for invalid service", async () => {
    // override the default to simulate a service that doesnt exist
    Service.findOne.mockResolvedValue(null);

    const res = await request(app).post("/api/queues/fake-service/serve");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Service queue not found");
  });

  // --- TESTS FOR MOVING/REORDERING USERS ---
  test("Move user up in the queue", async () => {
    // Setup: Add two users to ensure we have someone to move up
    QueueEntry.countDocuments
      .mockResolvedValueOnce(0)  // first join
      .mockResolvedValueOnce(1); // second join
    QueueEntry.create
      .mockResolvedValueOnce({ ticketId: "D001", name: "Person 1", status: "waiting" })
      .mockResolvedValueOnce({ ticketId: "D002", name: "Person 2", status: "waiting" });
    // move: find the user then the adjacent user to swap positions
    QueueEntry.findOne
      .mockResolvedValueOnce({ _id: "id2", queueId: "dmv", ticketId: "D002", name: "Person 2", position: 2, status: "waiting" })
      .mockResolvedValueOnce({ _id: "id1", queueId: "dmv", ticketId: "D001", name: "Person 1", position: 1, status: "waiting" });
    QueueEntry.findByIdAndUpdate.mockResolvedValue({});
    QueueEntry.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { ticketId: "D002", name: "Person 2" },
        { ticketId: "D001", name: "Person 1" }
      ])
    });

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
    // override findOne to return null for the user lookup
    QueueEntry.findOne.mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/queues/dmv/FAKE999/move")
      .send({ direction: "down" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
});
