const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const { getAllHistory, getHistoryByTicket, getHistoryByService, getReportData } = require('../controllers/historyController');

// get full history log
router.get('/', authenticateToken, authorizeRoles('admin'), getAllHistory);

// get aggregated report data
router.get('/report', authenticateToken, authorizeRoles('admin'), getReportData);

// get history for a specific service
router.get('/service/:serviceId', authenticateToken, authorizeRoles('admin'), getHistoryByService);

// get history for a specific ticket
router.get('/:ticketId', authenticateToken, authorizeRoles('admin'), getHistoryByTicket);

module.exports = router;
