const request = require("supertest");
const express = require("express");
const serviceRoutes = require("../routes/serviceRoutes");

jest.mock("../models/service");
jest.mock("../models/queue");

const Service = require("../models/service");
const Queue = require("../models/queue");

const app = express();
app.use(express.json());
app.use("/api/services", serviceRoutes);

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
      serviceId: "dmv", name: "DMV", description: "License renewal", duration: 30, priority: "High"
    });
  });

  test("should reject missing fields", async () => {
    const res = await request(app)
      .post("/api/services")
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

    const res = await request(app).get("/api/services");

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
      .send({ duration: 45 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Service.findOneAndUpdate).toHaveBeenCalled();
  });

  test("should return 404 when updating a non-existent service", async () => {
    Service.findOneAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put("/api/services/fakeID999")
      .send({ name: "New Name" });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Service not found");
  });
});
