const request = require("supertest");
const express = require("express");
const authRoutes = require("../routes/authRoutes");
const UserCredentials = require("../models/userCredentials");
const UserProfile = require("../models/userProfile");
const bcrypt = require("bcryptjs");

jest.mock("../models/userCredentials");
jest.mock("../models/userProfile");
jest.mock("bcryptjs");

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

beforeEach(() => {
  jest.clearAllMocks();
  bcrypt.hash.mockResolvedValue("hashed-password");
  bcrypt.compare.mockResolvedValue(true);
  UserCredentials.deleteOne.mockResolvedValue({ deletedCount: 1 });
  UserProfile.deleteOne.mockResolvedValue({ deletedCount: 1 });
});

describe("Auth API", () => {
  describe("POST /auth/register", () => {
    test("rejects when required fields are missing", async () => {
      const res = await request(app).post("/auth/register").send({
        firstName: "Jane",
        email: "jane@example.com",
        password: "secret123"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("First name, last name, email, and password are required");
    });

    test("rejects invalid email format", async () => {
      const res = await request(app).post("/auth/register").send({
        firstName: "Jane",
        lastName: "Smith",
        email: "not-an-email",
        password: "secret123"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Please provide a valid email address");
    });

    test("rejects passwords shorter than 6 characters", async () => {
      const res = await request(app).post("/auth/register").send({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        password: "12345"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Password must be at least 6 characters long");
    });

    test("rejects first name shorter than 2 characters", async () => {
      const res = await request(app).post("/auth/register").send({
        firstName: "J",
        lastName: "Smith",
        email: "jane@example.com",
        password: "secret123"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("First name must be between 2 and 50 characters");
    });

    test("rejects email longer than 100 characters", async () => {
      const longLocal = "a".repeat(95);
      const longEmail = `${longLocal}@x.com`;

      const res = await request(app).post("/auth/register").send({
        firstName: "Jane",
        lastName: "Smith",
        email: longEmail,
        password: "secret123"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Email cannot exceed 100 characters");
    });

    test("rejects duplicate emails", async () => {
      UserCredentials.findOne.mockResolvedValue({ _id: "existing-id" });

      const res = await request(app).post("/auth/register").send({
        firstName: "Jane",
        lastName: "Smith",
        email: "john.doe@example.com",
        password: "secret123"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Email already in use");
    });

    test("registers a new user and assigns default role", async () => {
      UserCredentials.findOne.mockResolvedValue(null);
      UserCredentials.create.mockResolvedValue({
        _id: "user-id-3",
        email: "jane.smith@example.com",
        role: "user"
      });
      UserProfile.create.mockResolvedValue({});

      const payload = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        password: "secret123"
      };

      const res = await request(app).post("/auth/register").send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("User registered");
      expect(res.body.user).toEqual({
        id: "user-id-3",
        fullName: "Jane Smith",
        email: payload.email,
        role: "user"
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(payload.password, 10);
      expect(UserCredentials.create).toHaveBeenCalledWith({
        email: payload.email,
        passwordHash: "hashed-password",
        role: "user"
      });
      expect(UserProfile.create).toHaveBeenCalledWith({
        credentialId: "user-id-3",
        fullName: "Jane Smith",
        email: payload.email,
        contactInfo: "",
        preferences: {}
      });
    });

    test("normalizes and trims email before querying and creating", async () => {
      UserCredentials.findOne.mockResolvedValue(null);
      UserCredentials.create.mockResolvedValue({
        _id: "user-id-4",
        email: "jane.smith@example.com",
        role: "user"
      });
      UserProfile.create.mockResolvedValue({});

      const res = await request(app).post("/auth/register").send({
        firstName: "Jane",
        lastName: "Smith",
        email: "  JANE.SMITH@EXAMPLE.COM  ",
        password: "secret123"
      });

      expect(res.statusCode).toBe(201);
      expect(UserCredentials.findOne).toHaveBeenCalledWith({
        email: "jane.smith@example.com"
      });
      expect(UserCredentials.create).toHaveBeenCalledWith({
        email: "jane.smith@example.com",
        passwordHash: "hashed-password",
        role: "user"
      });
    });

    test("returns duplicate email when create hits unique index error", async () => {
      UserCredentials.findOne.mockResolvedValue(null);
      UserCredentials.create.mockRejectedValue({ code: 11000 });

      const res = await request(app).post("/auth/register").send({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        password: "secret123"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Email already in use");
    });

    test("rolls back credential when profile creation fails", async () => {
      UserCredentials.findOne.mockResolvedValue(null);
      UserCredentials.create.mockResolvedValue({
        _id: "user-id-rollback",
        email: "jane.smith@example.com",
        role: "user"
      });
      UserProfile.create.mockRejectedValue(new Error("profile create failed"));

      const res = await request(app).post("/auth/register").send({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        password: "secret123"
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe("Unable to register user");
      expect(UserCredentials.deleteOne).toHaveBeenCalledWith({ _id: "user-id-rollback" });
      expect(UserProfile.deleteOne).toHaveBeenCalledWith({ credentialId: "user-id-rollback" });
    });
  });

  describe("POST /auth/login", () => {
    test("requires both email and password", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "john.doe@example.com"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Email and password required");
    });

    test("rejects invalid credentials", async () => {
      UserCredentials.findOne.mockResolvedValue(null);

      const res = await request(app).post("/auth/login").send({
        email: "john.doe@example.com",
        password: "wrongpass"
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });

    test("logs in with valid credentials and returns role", async () => {
      UserCredentials.findOne.mockResolvedValue({
        email: "admin@example.com",
        passwordHash: "hashed-admin-password",
        role: "admin"
      });

      const res = await request(app).post("/auth/login").send({
        email: "admin@example.com",
        password: "adminpass"
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        message: "Login successful",
        role: "admin"
      });
      expect(bcrypt.compare).toHaveBeenCalledWith("adminpass", "hashed-admin-password");
    });
  });
});