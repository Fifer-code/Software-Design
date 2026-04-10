const request = require("supertest");
const express = require("express");
const historyRoutes = require("../routes/historyRoutes");
const History = require("../models/history");

jest.mock("../models/history");

const app = express();
app.use(express.json());
app.use("/api/history", historyRoutes);

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

            const res = await request(app).get("/api/history");
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

            const res = await request(app).get("/api/history/D001");
            expect(res.statusCode).toBe(200);
            expect(res.body.history).toHaveLength(1);
            expect(res.body.history[0].ticketId).toBe("D001");
        });

        test("returns empty array when no history exists for ticket", async () => {
            History.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

            const res = await request(app).get("/api/history/ZZZZ");
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

            const res = await request(app).get("/api/history/service/dmv");
            expect(res.statusCode).toBe(200);
            expect(res.body.history).toHaveLength(2);
            expect(res.body.history[0].serviceId).toBe("dmv");
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
