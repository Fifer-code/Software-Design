const request = require("supertest");
const express = require("express");
const serviceRoutes = require("../routes/serviceRoutes");


const app = express();
app.use(express.json());
app.use("/api/services", serviceRoutes);

describe("Services API", () => {
  test("should create a service", async () => {
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
    expect(res.body.service.name).toBe("DMV");
    expect(res.body.service.duration).toBe(30);
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
  });
});
