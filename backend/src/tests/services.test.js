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

  // Test for getService (getting the list of all services)
  test("should retrieve all services", async () => {
    const res = await request(app).get("/api/services");
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.services)).toBe(true);
  });

  // Tests for updateService (updating form fields and testing the 404 error)
  test("should update an existing service successfully", async () => {
    // Updating the default 'dmv' service's duration to 45
    const res = await request(app)
      .put("/api/services/dmv") // *NOTE: Change .put to .patch if your serviceRoutes.js uses router.patch()
      .send({ duration: 45 });
      
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.service.duration).toBe(45);
  });

  test("should return 404 when updating a non-existent service", async () => {
    // Intentionally sending a bad ID to trigger the 404 error block
    const res = await request(app)
      .put("/api/services/fakeID999")
      .send({ name: "New Name" });
      
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Service not found");
  });
});
