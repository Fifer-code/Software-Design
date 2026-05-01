const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const notificationRoutes = require("../routes/notificationRoutes");

jest.mock("../models/notification");
jest.mock("../models/queueEntry");

const Notification = require("../models/notification");
const QueueEntry = require("../models/queueEntry");

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

    describe("POST /api/notifications/admin", () => {
        test("sends admin notification to all waiting users", async () => {
            QueueEntry.find.mockResolvedValue([
                { ticketId: "D001", name: "Alice", queueId: "dmv" },
                { ticketId: "D002", name: "Bob", queueId: "dmv" }
            ]);
            Notification.create.mockResolvedValue({});

            const res = await request(app)
                .post("/api/notifications/admin")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ serviceId: "dmv", message: "Queue will close in 10 minutes" });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.notifications).toHaveLength(2);
            expect(Notification.create).toHaveBeenCalledTimes(2);
        });

        test("returns 404 when no users are waiting in that queue", async () => {
            QueueEntry.find.mockResolvedValue([]);

            const res = await request(app)
                .post("/api/notifications/admin")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ serviceId: "dmv", message: "Closing soon" });

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        test("returns 400 when serviceId or message is missing", async () => {
            const res = await request(app)
                .post("/api/notifications/admin")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ serviceId: "dmv" });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
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
