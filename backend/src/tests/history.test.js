const request = require("supertest");
const express = require("express");
const serviceRoutes = require("../routes/serviceRoutes");
const queueRoutes = require("../routes/queueRoutes");
const historyRoutes = require("../routes/historyRoutes");
const { resetHistory } = require("../controllers/historyController");
const { resetQueues } = require("../controllers/queueController");

const app = express();
app.use(express.json());
app.use("/api/services", serviceRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/history", historyRoutes);

// reset both history and queues before each test so state doesn't bleed between tests
beforeEach(() => {
    resetHistory();
    resetQueues();
});

describe("History Module", () => {

    test("Joining a queue creates a 'joined' history entry", async () => {
        await request(app).post("/api/services").send({
            id: "dmv", name: "DMV", description: "DMV services", duration: 10, priority: "Low"
        });

        const joinRes = await request(app)
            .post("/api/queues/dmv/join")
            .send({ name: "Alice" });

        expect(joinRes.statusCode).toBe(200);
        const ticketId = joinRes.body.ticketId;

        const histRes = await request(app).get(`/api/history/${ticketId}`);
        expect(histRes.statusCode).toBe(200);
        expect(histRes.body.history.length).toBe(1);
        expect(histRes.body.history[0].event).toBe("joined");
        expect(histRes.body.history[0].name).toBe("Alice");
        expect(histRes.body.history[0].serviceId).toBe("dmv");
    });

    test("Serving a user creates a 'served' history entry", async () => {
        await request(app).post("/api/services").send({
            id: "bank", name: "Bank", description: "Bank services", duration: 10, priority: "Low"
        });

        const joinRes = await request(app)
            .post("/api/queues/bank/join")
            .send({ name: "Bob" });

        const ticketId = joinRes.body.ticketId;
        resetHistory(); // clear join entry so we only check served entry

        await request(app).post("/api/queues/bank/serve");

        const histRes = await request(app).get(`/api/history/${ticketId}`);
        expect(histRes.statusCode).toBe(200);
        expect(histRes.body.history.length).toBe(1);
        expect(histRes.body.history[0].event).toBe("served");
        expect(histRes.body.history[0].name).toBe("Bob");
    });

    test("Removing a user creates a 'removed' history entry", async () => {
        await request(app).post("/api/services").send({
            id: "dmv", name: "DMV", description: "DMV services", duration: 10, priority: "Low"
        });

        const joinRes = await request(app)
            .post("/api/queues/dmv/join")
            .send({ name: "Charlie" });

        const ticketId = joinRes.body.ticketId;
        resetHistory();

        await request(app).delete(`/api/queues/dmv/${ticketId}`);

        const histRes = await request(app).get(`/api/history/${ticketId}`);
        expect(histRes.statusCode).toBe(200);
        expect(histRes.body.history.length).toBe(1);
        expect(histRes.body.history[0].event).toBe("removed");
        expect(histRes.body.history[0].name).toBe("Charlie");
    });

    test("GET /api/history returns all entries", async () => {
        await request(app).post("/api/services").send({
            id: "dmv", name: "DMV", description: "DMV services", duration: 10, priority: "Low"
        });

        await request(app).post("/api/queues/dmv/join").send({ name: "Alice" });
        await request(app).post("/api/queues/dmv/join").send({ name: "Bob" });

        const histRes = await request(app).get("/api/history");
        expect(histRes.statusCode).toBe(200);
        expect(histRes.body.history.length).toBe(2);
    });

    test("GET /api/history/service/:serviceId returns only that service's entries", async () => {
        await request(app).post("/api/services").send({
            id: "dmv", name: "DMV", description: "DMV services", duration: 10, priority: "Low"
        });
        await request(app).post("/api/services").send({
            id: "bank", name: "Bank", description: "Bank services", duration: 10, priority: "Low"
        });

        await request(app).post("/api/queues/dmv/join").send({ name: "Alice" });
        await request(app).post("/api/queues/bank/join").send({ name: "Bob" });

        const histRes = await request(app).get("/api/history/service/dmv");
        expect(histRes.statusCode).toBe(200);
        expect(histRes.body.history.length).toBe(1);
        expect(histRes.body.history[0].serviceId).toBe("dmv");
        expect(histRes.body.history[0].name).toBe("Alice");
    });

    test("A ticket has both joined and served entries across its full history", async () => {
        await request(app).post("/api/services").send({
            id: "dmv", name: "DMV", description: "DMV services", duration: 10, priority: "Low"
        });

        const joinRes = await request(app)
            .post("/api/queues/dmv/join")
            .send({ name: "Alice" });

        const ticketId = joinRes.body.ticketId;

        await request(app).post("/api/queues/dmv/serve");

        const histRes = await request(app).get(`/api/history/${ticketId}`);
        expect(histRes.body.history.length).toBe(2);
        expect(histRes.body.history[0].event).toBe("joined");
        expect(histRes.body.history[1].event).toBe("served");
    });

});
