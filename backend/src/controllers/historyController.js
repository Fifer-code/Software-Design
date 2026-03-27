// in-memory history log — persists for the lifetime of the server process
let history = [];

// called from queueController when a user joins a queue
const recordJoin = (ticketId, name, serviceId) => {
    const entry = {
        id: history.length + 1,
        ticketId,
        name,
        serviceId,
        event: 'joined',
        timestamp: new Date().toISOString()
    };
    history.push(entry);
    console.log(`[HISTORY] ${name} (${ticketId}) joined the ${serviceId} queue.`);
    return entry;
};

// called from queueController when a user is served (removed from front)
const recordServed = (ticketId, name, serviceId) => {
    const entry = {
        id: history.length + 1,
        ticketId,
        name,
        serviceId,
        event: 'served',
        timestamp: new Date().toISOString()
    };
    history.push(entry);
    console.log(`[HISTORY] ${name} (${ticketId}) was served in the ${serviceId} queue.`);
    return entry;
};

// called from queueController when a user is manually removed
const recordRemoved = (ticketId, name, serviceId) => {
    const entry = {
        id: history.length + 1,
        ticketId,
        name,
        serviceId,
        event: 'removed',
        timestamp: new Date().toISOString()
    };
    history.push(entry);
    console.log(`[HISTORY] ${name} (${ticketId}) was removed from the ${serviceId} queue.`);
    return entry;
};

// GET /api/history — return full history log
const getAllHistory = (req, res) => {
    res.json({ success: true, history });
};

// GET /api/history/:ticketId — return history for a specific ticket
const getHistoryByTicket = (req, res) => {
    const { ticketId } = req.params;
    const userHistory = history.filter(e => e.ticketId === ticketId);
    res.json({ success: true, history: userHistory });
};

// GET /api/history/service/:serviceId — return history for a specific service
const getHistoryByService = (req, res) => {
    const { serviceId } = req.params;
    const serviceHistory = history.filter(e => e.serviceId === serviceId);
    res.json({ success: true, history: serviceHistory });
};

// used by tests to reset state between runs
const resetHistory = () => {
    history = [];
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
