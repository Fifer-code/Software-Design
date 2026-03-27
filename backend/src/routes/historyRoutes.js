const express = require('express');
const router = express.Router();

const { getAllHistory, getHistoryByTicket, getHistoryByService } = require('../controllers/historyController');

// get full history log
router.get('/', getAllHistory);

// get history for a specific service
router.get('/service/:serviceId', getHistoryByService);

// get history for a specific ticket
router.get('/:ticketId', getHistoryByTicket);

module.exports = router;
