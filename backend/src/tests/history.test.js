const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const historyRoutes = require("../routes/historyRoutes");
const History = require("../models/history");

jest.mock("../models/history");

const app = express();
app.use(express.json());
app.use("/api/history", historyRoutes);

const adminToken = jwt.sign(
    { sub: "test-admin-id", email: "admin@example.com", role: "admin" },
    "dev-only-secret-change-me"
);

beforeEach(() => {
    jest.clearAllMocks();
});

describe("History API", () => {

    describe("GET /api/history", () => {
        test("returns all history entries", async () => {
            const mockHistory = [
                { ticketId: "D001", name: "Alice", serviceId: "dmv", event: "joined", message: "Alice joined" },
                { ticketId: "D001", name: "Alice", serviceId: "dmv", event: "served", message: "Alice was served" }
            ];
            History.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockHistory) });

            const res = await request(app).get("/api/history").set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.history).toHaveLength(2);
        });
    });

    describe("GET /api/history/:ticketId", () => {
        test("returns history for a specific ticket", async () => {
            const mockHistory = [
                { ticketId: "D001", name: "Alice", serviceId: "dmv", event: "joined", message: "Alice joined" }
            ];
            History.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockHistory) });

            const res = await request(app).get("/api/history/D001").set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.history).toHaveLength(1);
            expect(res.body.history[0].ticketId).toBe("D001");
        });

        test("returns empty array when no history exists for ticket", async () => {
            History.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

            const res = await request(app).get("/api/history/ZZZZ").set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.history).toHaveLength(0);
        });
    });

    describe("GET /api/history/service/:serviceId", () => {
        test("returns history for a specific service", async () => {
            const mockHistory = [
                { ticketId: "D001", name: "Alice", serviceId: "dmv", event: "joined" },
                { ticketId: "D002", name: "Bob", serviceId: "dmv", event: "served" }
            ];
            History.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockHistory) });

            const res = await request(app).get("/api/history/service/dmv").set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.history).toHaveLength(2);
            expect(res.body.history[0].serviceId).toBe("dmv");
        });
    });

    describe("GET /api/history/report", () => {
        test("returns stats and history for the report", async () => {
            const now = new Date();
            const fiveMinAgo = new Date(now - 5 * 60 * 1000);

            const mockHistory = [
                { ticketId: "D001", name: "Alice", serviceId: "dmv", event: "joined", timestamp: fiveMinAgo },
                { ticketId: "D001", name: "Alice", serviceId: "dmv", event: "served", timestamp: now },
                { ticketId: "D002", name: "Bob", serviceId: "dmv", event: "joined", timestamp: fiveMinAgo },
                { ticketId: "D002", name: "Bob", serviceId: "dmv", event: "removed", timestamp: now }
            ];
            History.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockHistory) });

            const res = await request(app).get("/api/history/report").set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.history).toHaveLength(4);
            expect(Array.isArray(res.body.stats)).toBe(true);
            expect(res.body.stats[0].serviceId).toBe("dmv");
            expect(res.body.stats[0].joined).toBe(2);
            expect(res.body.stats[0].served).toBe(1);
            expect(res.body.stats[0].removed).toBe(1);
        });

        test("returns empty stats when no history exists", async () => {
            History.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

            const res = await request(app).get("/api/history/report").set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.history).toHaveLength(0);
            expect(res.body.stats).toHaveLength(0);
        });

        test("returns 500 on database error", async () => {
            History.find.mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error("DB error")) });

            const res = await request(app).get("/api/history/report").set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(500);
            expect(res.body.success).toBe(false);
        });
    });

    describe("History trigger functions", () => {
        test("recordJoin creates a joined history entry in DB", async () => {
            const { recordJoin } = require("../controllers/historyController");
            const mockEntry = { ticketId: "D001", name: "Alice", serviceId: "dmv", event: "joined" };
            History.create.mockResolvedValue(mockEntry);

            const result = await recordJoin("D001", "Alice", "dmv");
            expect(History.create).toHaveBeenCalledWith(expect.objectContaining({
                ticketId: "D001",
                name: "Alice",
                serviceId: "dmv",
                event: "joined"
            }));
            expect(result.event).toBe("joined");
        });

        test("recordServed creates a served history entry in DB", async () => {
            const { recordServed } = require("../controllers/historyController");
            const mockEntry = { ticketId: "D001", name: "Alice", serviceId: "dmv", event: "served" };
            History.create.mockResolvedValue(mockEntry);

            const result = await recordServed("D001", "Alice", "dmv");
            expect(History.create).toHaveBeenCalledWith(expect.objectContaining({
                event: "served"
            }));
            expect(result.event).toBe("served");
        });

        test("recordRemoved creates a removed history entry in DB", async () => {
            const { recordRemoved } = require("../controllers/historyController");
            const mockEntry = { ticketId: "D001", name: "Alice", serviceId: "dmv", event: "removed" };
            History.create.mockResolvedValue(mockEntry);

            const result = await recordRemoved("D001", "Alice", "dmv");
            expect(History.create).toHaveBeenCalledWith(expect.objectContaining({
                event: "removed"
            }));
            expect(result.event).toBe("removed");
        });
    });

});
