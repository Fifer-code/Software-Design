const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const notificationRoutes = require("../routes/notificationRoutes");
const Notification = require("../models/notification");

jest.mock("../models/notification");

const app = express();
app.use(express.json());
app.use("/api/notifications", notificationRoutes);

const adminToken = jwt.sign(
    { sub: "test-admin-id", email: "admin@example.com", role: "admin" },
    "dev-only-secret-change-me"
);

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Notification API", () => {

    describe("GET /api/notifications", () => {
        test("returns all notifications", async () => {
            const mockNotifs = [
                { ticketId: "D001", name: "Alice", serviceId: "dmv", type: "joined", message: "Alice joined", status: "sent" },
                { ticketId: "D002", name: "Bob", serviceId: "dmv", type: "near_front", message: "Bob is near front", status: "sent" }
            ];
            Notification.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockNotifs) });

            const res = await request(app).get("/api/notifications").set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.notifications).toHaveLength(2);
        });
    });

    describe("GET /api/notifications/:ticketId", () => {
        test("returns notifications for a specific ticket", async () => {
            const mockNotifs = [
                { ticketId: "D001", name: "Alice", serviceId: "dmv", type: "joined", message: "Alice joined", status: "sent" }
            ];
            Notification.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockNotifs) });

            const res = await request(app).get("/api/notifications/D001").set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.notifications).toHaveLength(1);
            expect(res.body.notifications[0].ticketId).toBe("D001");
        });

        test("returns empty array when no notifications exist for ticket", async () => {
            Notification.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

            const res = await request(app).get("/api/notifications/ZZZZ").set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.notifications).toHaveLength(0);
        });
    });

    describe("PATCH /api/notifications/:id/viewed", () => {
        test("marks a notification as viewed", async () => {
            const updated = { _id: "abc123", ticketId: "D001", status: "viewed" };
            Notification.findByIdAndUpdate.mockResolvedValue(updated);

            const res = await request(app).patch("/api/notifications/abc123/viewed").set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.notification.status).toBe("viewed");
        });

        test("returns 404 if notification not found", async () => {
            Notification.findByIdAndUpdate.mockResolvedValue(null);

            const res = await request(app).patch("/api/notifications/nonexistent/viewed").set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("Notification not found");
        });
    });

    describe("Notification trigger functions", () => {
        test("triggerJoinNotification creates a joined notification in DB", async () => {
            const { triggerJoinNotification } = require("../controllers/notificationController");
            const mockNotif = { ticketId: "D001", name: "Alice", serviceId: "dmv", type: "joined", status: "sent" };
            Notification.create.mockResolvedValue(mockNotif);

            const result = await triggerJoinNotification("D001", "Alice", "dmv");
            expect(Notification.create).toHaveBeenCalledWith(expect.objectContaining({
                ticketId: "D001",
                name: "Alice",
                serviceId: "dmv",
                type: "joined",
                status: "sent"
            }));
            expect(result.type).toBe("joined");
        });

        test("triggerNearFrontNotification creates a near_front notification in DB", async () => {
            const { triggerNearFrontNotification } = require("../controllers/notificationController");
            const mockNotif = { ticketId: "D002", name: "Bob", serviceId: "dmv", type: "near_front", status: "sent" };
            Notification.create.mockResolvedValue(mockNotif);

            const result = await triggerNearFrontNotification("D002", "Bob", "dmv", 1);
            expect(Notification.create).toHaveBeenCalledWith(expect.objectContaining({
                ticketId: "D002",
                type: "near_front",
                status: "sent"
            }));
            expect(result.type).toBe("near_front");
        });
    });

});
