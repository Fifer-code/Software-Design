const Notification = require('../models/notification');

// called from queueController when a user joins a queue
const triggerJoinNotification = async (ticketId, name, serviceId) => {
    const notification = await Notification.create({
        ticketId,
        name,
        serviceId,
        type: 'joined',
        message: `${name} (${ticketId}) has joined the ${serviceId} queue.`,
        status: 'sent'
    });
    console.log(`[NOTIFICATION] ${notification.message}`);
    return notification;
};

// called from queueController when a user moves into position 1 or 2 after someone is served
const triggerNearFrontNotification = async (ticketId, name, serviceId, position) => {
    const notification = await Notification.create({
        ticketId,
        name,
        serviceId,
        type: 'near_front',
        message: `${name} (${ticketId}) is now position ${position} in the ${serviceId} queue — almost your turn!`,
        status: 'sent'
    });
    console.log(`[NOTIFICATION] ${notification.message}`);
    return notification;
};

// GET /api/notifications — return all logged notifications
const getAllNotifications = async (req, res) => {
    const notifications = await Notification.find().sort({ timestamp: -1 });
    res.json({ success: true, notifications });
};

// GET /api/notifications/:ticketId — return notifications for a specific ticket
const getNotificationsByTicket = async (req, res) => {
    const { ticketId } = req.params;
    const notifications = await Notification.find({ ticketId }).sort({ timestamp: 1 });
    res.json({ success: true, notifications });
};

// PATCH /api/notifications/:id/viewed — mark a notification as viewed
const markAsViewed = async (req, res) => {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
        id,
        { status: 'viewed' },
        { new: true }
    );
    if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification });
};

// used by tests to reset state between runs
const resetNotifications = async () => {
    await Notification.deleteMany({});
};

module.exports = {
    triggerJoinNotification,
    triggerNearFrontNotification,
    getAllNotifications,
    getNotificationsByTicket,
    markAsViewed,
    resetNotifications
};
