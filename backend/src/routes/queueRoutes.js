// set up routes
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// import all exports from queueController.js **MUST MATCH *
const { getWaitTime, getQueueList, serveNextUser, moveUser, removeUser, joinQueue, updateQueueStatus, clearAllQueues } = require('../controllers/queueController');

// respective calls for each function
// get calculated wait time
router.get('/wait-time', authenticateToken, authorizeRoles('user', 'admin'), getWaitTime);

// get the queue information
router.get('/', authenticateToken, authorizeRoles('user', 'admin'), getQueueList);

// create new arreay based off serve next user button in QueueManagement
router.post('/:serviceId/serve', authenticateToken, authorizeRoles('admin'), serveNextUser);

// update based off move up and down buttons in QueueManagement
router.patch('/:serviceId/:ticketId/move', authenticateToken, authorizeRoles('admin'), moveUser);

// delete based off remove user button in QueueManagement
router.delete('/:serviceId/:ticketId', authenticateToken, authorizeRoles('user', 'admin'), removeUser);

// join queue based off join queue button in UserDashboard
router.post('/:serviceId/join', authenticateToken, authorizeRoles('user', 'admin'), joinQueue);

// toggle pause/unpause or open/close a queue from Quick Actions in AdminDashboard
router.patch('/:serviceId/status', authenticateToken, authorizeRoles('admin'), updateQueueStatus);

// clear all waiting entries across all queues — end of day action
router.delete('/reset', authenticateToken, authorizeRoles('admin'), clearAllQueues);

module.exports = router;