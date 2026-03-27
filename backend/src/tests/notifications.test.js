const request = require("supertest");
const express = require("express");
const serviceRoutes = require("../routes/serviceRoutes");
const queueRoutes = require("../routes/queueRoutes");
const notificationRoutes = require("../routes/notificationRoutes");
const { resetNotifications } = require("../controllers/notificationController");
const { resetQueues } = require("../controllers/queueController");

const app = express();
app.use(express.json());
app.use("/api/services", serviceRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/notifications", notificationRoutes);

// reset both notifications and queues before each test so state doesn't bleed between tests
beforeEach(() => {
    resetNotifications();
    resetQueues();
});

describe("Notification Module", () => {

    test("Joining a queue creates a 'joined' notification", async () => {
        // set up service first
        await request(app).post("/api/services").send({
            id: "dmv",
            name: "DMV",
            description: "DMV services",
            duration: 10,
            priority: "Low"
        });

        const joinRes = await request(app)
            .post("/api/queues/dmv/join")
            .send({ name: "Alice" });

        expect(joinRes.statusCode).toBe(200);
        const ticketId = joinRes.body.ticketId;

        const notifRes = await request(app).get(`/api/notifications/${ticketId}`);
        expect(notifRes.statusCode).toBe(200);
        expect(notifRes.body.notifications.length).toBe(1);
        expect(notifRes.body.notifications[0].type).toBe("joined");
        expect(notifRes.body.notifications[0].name).toBe("Alice");
        expect(notifRes.body.notifications[0].serviceId).toBe("dmv");
    });

    test("Serving a user triggers 'near_front' notifications for positions 1 and 2", async () => {
        await request(app).post("/api/services").send({
            id: "bank",
            name: "Bank",
            description: "Bank services",
            duration: 10,
            priority: "Low"
        });

        // join 3 users so after serving position 0, positions 1 and 2 exist
        const join1 = await request(app).post("/api/queues/bank/join").send({ name: "User1" });
        const join2 = await request(app).post("/api/queues/bank/join").send({ name: "User2" });
        const join3 = await request(app).post("/api/queues/bank/join").send({ name: "User3" });

        resetNotifications(); // clear join notifications so we only check near_front ones

        await request(app).post("/api/queues/bank/serve");

        const allRes = await request(app).get("/api/notifications");
        expect(allRes.statusCode).toBe(200);

        const nearFront = allRes.body.notifications.filter(n => n.type === "near_front");
        expect(nearFront.length).toBe(2);
        expect(nearFront[0].ticketId).toBe(join2.body.ticketId);  // now position 1
        expect(nearFront[1].ticketId).toBe(join3.body.ticketId);  // now position 2
    });

    test("Serving a user with only 1 person left triggers only 1 'near_front' notification", async () => {
        await request(app).post("/api/services").send({
            id: "advising",
            name: "Advising",
            description: "Advising services",
            duration: 10,
            priority: "Low"
        });

        const join1 = await request(app).post("/api/queues/advising/join").send({ name: "OnlyUser" });
        const join2 = await request(app).post("/api/queues/advising/join").send({ name: "SecondUser" });

        resetNotifications();

        await request(app).post("/api/queues/advising/serve");

        const allRes = await request(app).get("/api/notifications");
        const nearFront = allRes.body.notifications.filter(n => n.type === "near_front");

        // only 1 person left after serving, so only 1 near_front notification
        expect(nearFront.length).toBe(1);
        expect(nearFront[0].ticketId).toBe(join2.body.ticketId);
    });

    test("GET /api/notifications returns all notifications", async () => {
        await request(app).post("/api/services").send({
            id: "dmv",
            name: "DMV",
            description: "DMV services",
            duration: 10,
            priority: "Low"
        });

        await request(app).post("/api/queues/dmv/join").send({ name: "Alice" });
        await request(app).post("/api/queues/dmv/join").send({ name: "Bob" });

        const res = await request(app).get("/api/notifications");
        expect(res.statusCode).toBe(200);
        expect(res.body.notifications.length).toBe(2);
    });

    test("GET /api/notifications/:ticketId returns only that user's notifications", async () => {
        await request(app).post("/api/services").send({
            id: "dmv",
            name: "DMV",
            description: "DMV services",
            duration: 10,
            priority: "Low"
        });

        const join1 = await request(app).post("/api/queues/dmv/join").send({ name: "Alice" });
        await request(app).post("/api/queues/dmv/join").send({ name: "Bob" });

        const res = await request(app).get(`/api/notifications/${join1.body.ticketId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.notifications.length).toBe(1);
        expect(res.body.notifications[0].name).toBe("Alice");
    });

});
