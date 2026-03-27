const request = require("supertest");
const express = require("express");
const authRoutes = require("../routes/authRoutes");
const users = require("../models/users");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

const seedUsers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: "testpass",
    role: "user"
  },
  {
    id: 2,
    firstName: "Admin",
    lastName: "Test",
    email: "admin@example.com",
    password: "adminpass",
    role: "admin"
  }
];

beforeEach(() => {
  users.length = 0;
  users.push(...seedUsers.map((user) => ({ ...user })));
});

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    test("rejects when required fields are missing", async () => {
      const res = await request(app).post("/api/auth/register").send({
        firstName: "Jane",
        email: "jane@example.com",
        password: "secret123"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("First name, last name, email, and password are required");
    });

    test("rejects invalid email format", async () => {
      const res = await request(app).post("/api/auth/register").send({
        firstName: "Jane",
        lastName: "Smith",
        email: "not-an-email",
        password: "secret123"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Please provide a valid email address");
    });

    test("rejects passwords shorter than 6 characters", async () => {
      const res = await request(app).post("/api/auth/register").send({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        password: "12345"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Password must be at least 6 characters long");
    });

    test("rejects duplicate emails", async () => {
      const res = await request(app).post("/api/auth/register").send({
        firstName: "Jane",
        lastName: "Smith",
        email: "john.doe@example.com",
        password: "secret123"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Email already in use");
    });

    test("registers a new user and assigns default role", async () => {
      const payload = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        password: "secret123"
      };

      const res = await request(app).post("/api/auth/register").send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("User registered");
      expect(res.body.user).toEqual({
        id: 3,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password,
        role: "user"
      });
      expect(users).toHaveLength(3);
    });
  });

  describe("POST /api/auth/login", () => {
    test("requires both email and password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "john.doe@example.com"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Email and password required");
    });

    test("rejects invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "john.doe@example.com",
        password: "wrongpass"
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });

    test("logs in with valid credentials and returns role", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "admin@example.com",
        password: "adminpass"
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        message: "Login successful",
        role: "admin"
      });
    });
  });
});