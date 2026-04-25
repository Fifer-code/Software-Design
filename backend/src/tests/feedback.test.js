const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const feedbackRoutes = require("../routes/feedbackRoutes");

jest.mock("../models/feedback");

const Feedback = require("../models/feedback");

const app = express();
app.use(express.json());
app.use("/api/feedback", feedbackRoutes);

const adminToken = jwt.sign(
  { sub: "test-admin-id", email: "admin@example.com", role: "admin" },
  "dev-only-secret-change-me"
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Feedback API", () => {
  test("should submit feedback", async () => {
    Feedback.create.mockResolvedValue({
      rating: 5,
      comment: "Great service!"
    });

    const res = await request(app)
      .post("/api/feedback")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        rating: 5,
        comment: "Great service!"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.rating).toBe(5);
    expect(res.body.comment).toBe("Great service!");
    expect(Feedback.create).toHaveBeenCalled();
  });

  test("should reject invalid rating", async () => {
    Feedback.create.mockRejectedValue(
      new Error("Feedback validation failed")
    );

    const res = await request(app)
      .post("/api/feedback")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ rating: 10 });

    expect(res.statusCode).toBe(400);
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  test("should get all feedback", async () => {
    Feedback.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { rating: 5, comment: "Great service!" },
        { rating: 4, comment: "Pretty good" }
      ])
    });

    const res = await request(app).get("/api/feedback").set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0].rating).toBe(5);
    expect(Feedback.find).toHaveBeenCalled();
  });

  test("GET /api/feedback returns 500 on error", async () => {
  Feedback.find.mockReturnValue({
    sort: jest.fn().mockRejectedValue(new Error("DB error"))
  });

  const res = await request(app).get("/api/feedback").set("Authorization", `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(500);
  expect(typeof res.body.error).toBe("string");
});
});