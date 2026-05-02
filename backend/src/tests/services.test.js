const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const serviceRoutes = require("../routes/serviceRoutes");

jest.mock("../models/service");
jest.mock("../models/queue");
jest.mock("../models/queueEntry");

const Service = require("../models/service");
const Queue = require("../models/queue");
const QueueEntry = require("../models/queueEntry");

const app = express();
app.use(express.json());
app.use("/api/services", serviceRoutes);

const adminToken = jwt.sign(
  { sub: "test-admin-id", email: "admin@example.com", role: "admin" },
  "dev-only-secret-change-me"
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Services API", () => {
  test("should create a service", async () => {
    Service.create.mockResolvedValue({
      serviceId: "dmv", name: "DMV", description: "License renewal", duration: 30, priority: "High"
    });
    Queue.create.mockResolvedValue({});

    const res = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id: "dmv",
        name: "DMV",
        description: "License renewal",
        duration: 30,
        priority: "High",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.service).toBeDefined();
    expect(Service.create).toHaveBeenCalledWith({
        serviceId: "dmv", name: "DMV", description: "License renewal", duration: 30, priority: "High", category: undefined, ticketCounter: 0
    });
  });

  test("should reject missing fields", async () => {
    const res = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Missing required fields");
    expect(Service.create).not.toHaveBeenCalled();
  });

  // Gemini Fix: Extra tests generated to expand on existing tests
  // Test for getService (getting the list of all services)
  test("should retrieve all services", async () => {
    Service.find.mockResolvedValue([
      { serviceId: "dmv", name: "DMV Queue 1", description: "Standard DMV services", duration: 15, priority: "Low" }
    ]);

    const res = await request(app).get("/api/services").set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.services)).toBe(true);
    expect(Service.find).toHaveBeenCalled();
  });

  // Tests for updateService (updating form fields and testing the 404 error)
  test("should update an existing service successfully", async () => {
    Service.findOneAndUpdate.mockResolvedValue({
      serviceId: "dmv", name: "DMV Queue 1", description: "Standard DMV services", duration: 45, priority: "Low"
    });

    const res = await request(app)
      .put("/api/services/dmv")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ duration: 45 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Service.findOneAndUpdate).toHaveBeenCalled();
  });

  test("should return 404 when updating a non-existent service", async () => {
    Service.findOneAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put("/api/services/fakeID999")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "New Name" });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Service not found");
  });

  test("should delete a service successfully", async () => {
    Service.findOneAndDelete.mockResolvedValue({ serviceId: "dmv", name: "DMV Queue 1" });
    Queue.deleteMany.mockResolvedValue({ deletedCount: 1 });
    QueueEntry.deleteMany.mockResolvedValue({ deletedCount: 2 });

    const res = await request(app)
      .delete("/api/services/dmv")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Service.findOneAndDelete).toHaveBeenCalled();
    expect(Queue.deleteMany).toHaveBeenCalled();
    expect(QueueEntry.deleteMany).toHaveBeenCalled();
  });

  test("should return 404 when deleting a non-existent service", async () => {
    Service.findOneAndDelete.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/services/fakeID999")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
