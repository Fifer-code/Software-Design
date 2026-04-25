const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const { getAllNotifications, getNotificationsByTicket, markAsViewed } = require('../controllers/notificationController');

// get all notifications
router.get('/', authenticateToken, authorizeRoles('admin'), getAllNotifications);

// get notifications for a specific ticket
router.get('/:ticketId', authenticateToken, authorizeRoles('user', 'admin'), getNotificationsByTicket);

// mark a notification as viewed
router.patch('/:id/viewed', authenticateToken, authorizeRoles('user', 'admin'), markAsViewed);

module.exports = router;
