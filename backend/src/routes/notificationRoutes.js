const express = require('express');
const router = express.Router();

const { getAllNotifications, getNotificationsByTicket } = require('../controllers/notificationController');

// get all notifications (useful for admin or debugging)
router.get('/', getAllNotifications);

// get notifications for a specific ticket (for the user to poll)
router.get('/:ticketId', getNotificationsByTicket);

module.exports = router;
