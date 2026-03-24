// set up routes
const express = require('express');
const router = express.Router();

// import all exports from queueController.js **MUST MATCH *
const { getWaitTime, getQueueList, serveNextUser, moveUser, removeUser, joinQueue } = require('../controllers/queueController');

// respective calls for each function
// get calculated wait time
router.get('/wait-time', getWaitTime);

// get the queue information
router.get('/', getQueueList);

// create new arreay based off serve next user button in QueueManagement
router.post('/:serviceId/serve', serveNextUser);

// update based off move up and down buttons in QueueManagement
router.patch('/:serviceId/:ticketId/move', moveUser);

// delete based off remove user button in QueueManagement
router.delete('/:serviceId/:ticketId', removeUser);

// join queue based off join queue button in UserDashboard
router.post('/:serviceId/join', joinQueue);

module.exports = router;