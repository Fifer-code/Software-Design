// in-memory notification log — persists for the lifetime of the server process
let notifications = [];

// called from queueController when a user joins a queue
const triggerJoinNotification = (ticketId, name, serviceId) => {
    const notification = {
        id: notifications.length + 1,
        ticketId,
        name,
        serviceId,
        type: 'joined',
        message: `${name} (${ticketId}) has joined the ${serviceId} queue.`,
        timestamp: new Date().toISOString()
    };
    notifications.push(notification);
    console.log(`[NOTIFICATION] ${notification.message}`);
    return notification;
};

// called from queueController when a user moves into position 1 or 2 after someone is served
const triggerNearFrontNotification = (ticketId, name, serviceId, position) => {
    const notification = {
        id: notifications.length + 1,
        ticketId,
        name,
        serviceId,
        type: 'near_front',
        message: `${name} (${ticketId}) is now position ${position} in the ${serviceId} queue — almost your turn!`,
        timestamp: new Date().toISOString()
    };
    notifications.push(notification);
    console.log(`[NOTIFICATION] ${notification.message}`);
    return notification;
};

// GET /api/notifications — return all logged notifications
const getAllNotifications = (req, res) => {
    res.json({ success: true, notifications });
};

// GET /api/notifications/:ticketId — return notifications for a specific ticket
const getNotificationsByTicket = (req, res) => {
    const { ticketId } = req.params;
    const userNotifications = notifications.filter(n => n.ticketId === ticketId);
    res.json({ success: true, notifications: userNotifications });
};

// used by tests to reset state between runs
const resetNotifications = () => {
    notifications = [];
};

module.exports = {
    triggerJoinNotification,
    triggerNearFrontNotification,
    getAllNotifications,
    getNotificationsByTicket,
    resetNotifications
};
