const History = require('../models/history');

// called from queueController when a user joins a queue
const recordJoin = async (ticketId, name, serviceId) => {
    const entry = await History.create({
        ticketId,
        name,
        serviceId,
        event: 'joined',
        message: `${name} (${ticketId}) joined the ${serviceId} queue.`
    });
    console.log(`[HISTORY] ${entry.message}`);
    return entry;
};

// called from queueController when a user is served (removed from front)
const recordServed = async (ticketId, name, serviceId) => {
    const entry = await History.create({
        ticketId,
        name,
        serviceId,
        event: 'served',
        message: `${name} (${ticketId}) was served in the ${serviceId} queue.`
    });
    console.log(`[HISTORY] ${entry.message}`);
    return entry;
};

// called from queueController when a user is manually removed
const recordRemoved = async (ticketId, name, serviceId) => {
    const entry = await History.create({
        ticketId,
        name,
        serviceId,
        event: 'removed',
        message: `${name} (${ticketId}) was removed from the ${serviceId} queue.`
    });
    console.log(`[HISTORY] ${entry.message}`);
    return entry;
};

// GET /api/history — return full history log
const getAllHistory = async (req, res) => {
    const history = await History.find().sort({ timestamp: -1 });
    res.json({ success: true, history });
};

// GET /api/history/:ticketId — return history for a specific ticket
const getHistoryByTicket = async (req, res) => {
    const { ticketId } = req.params;
    const history = await History.find({ ticketId }).sort({ timestamp: 1 });
    res.json({ success: true, history });
};

// GET /api/history/service/:serviceId — return history for a specific service
const getHistoryByService = async (req, res) => {
    const { serviceId } = req.params;
    const history = await History.find({ serviceId }).sort({ timestamp: -1 });
    res.json({ success: true, history });
};

// used by tests to reset state between runs
const resetHistory = async () => {
    await History.deleteMany({});
};

module.exports = {
    recordJoin,
    recordServed,
    recordRemoved,
    getAllHistory,
    getHistoryByTicket,
    getHistoryByService,
    resetHistory
};
