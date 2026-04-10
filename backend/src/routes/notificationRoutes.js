const express = require('express');
const router = express.Router();

const { getAllNotifications, getNotificationsByTicket, markAsViewed } = require('../controllers/notificationController');

// get all notifications
router.get('/', getAllNotifications);

// get notifications for a specific ticket
router.get('/:ticketId', getNotificationsByTicket);

// mark a notification as viewed
router.patch('/:id/viewed', markAsViewed);

module.exports = router;
