const request = require("supertest");
const express = require("express");
const feedbackRoutes = require("../routes/feedbackRoutes");

const app = express();
app.use(express.json());
app.use("/api/feedback", feedbackRoutes);

describe("Feedback API", () => {

  test("should submit feedback", async () => {

    const res = await request(app)
      .post("/api/feedback")
      .send({
        rating: 5,
        comment: "Great service!"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.rating).toBe(5);
    expect(res.body.comment).toBe("Great service!");
  });

test("should reject invalid rating", async () => {
  const res = await request(app)
    .post("/api/feedback")
    .send({ rating: 10 });

  expect(res.statusCode).toBe(400);
  expect(typeof res.body.error).toBe("string");
  expect(res.body.error.length).toBeGreaterThan(0);
});

});