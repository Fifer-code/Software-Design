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
    console.log(`[HISTORY] ${entry?.message || `${name} (${ticketId}) joined the ${serviceId} queue.`}`);
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
    console.log(`[HISTORY] ${entry?.message || `${name} (${ticketId}) was served in the ${serviceId} queue.`}`);
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
    console.log(`[HISTORY] ${entry?.message || `${name} (${ticketId}) was removed from the ${serviceId} queue.`}`);
    return entry;
};

// GET /api/history — return history log, optional ?limit=N
const getAllHistory = async (req, res) => {
    const limit = parseInt(req.query.limit) || 0;
    const query = History.find().sort({ timestamp: -1 });
    const history = limit > 0 ? await query.limit(limit) : await query;
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

// GET /api/history/report — aggregated stats + full log for the reports page
const getReportData = async (req, res) => {
    try {
        const history = await History.find().sort({ timestamp: -1 });

        // count events per service
        const statsMap = {};
        for (const entry of history) {
            if (!statsMap[entry.serviceId]) {
                statsMap[entry.serviceId] = { joined: 0, served: 0, removed: 0, waitTimes: [] };
            }
            statsMap[entry.serviceId][entry.event]++;
        }

        // calculate average wait time per service using join/serve timestamp pairs
        const servedEntries = history.filter(e => e.event === 'served');
        const joinedEntries = history.filter(e => e.event === 'joined');
        for (const served of servedEntries) {
            const join = joinedEntries.find(j => j.ticketId === served.ticketId && j.serviceId === served.serviceId);
            if (join) {
                const waitMinutes = (new Date(served.timestamp) - new Date(join.timestamp)) / 60000;
                statsMap[served.serviceId].waitTimes.push(waitMinutes);
            }
        }

        const stats = Object.entries(statsMap).map(([serviceId, s]) => ({
            serviceId,
            joined: s.joined,
            served: s.served,
            removed: s.removed,
            avgWaitMinutes: s.waitTimes.length
                ? Math.round(s.waitTimes.reduce((a, b) => a + b, 0) / s.waitTimes.length)
                : null
        }));

        res.json({ success: true, history, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
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
    getReportData,
    resetHistory
};
