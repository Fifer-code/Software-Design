// import data from serviceController
const { serviceConfig } = require('./serviceController');

// fake queues to test
// ticketId legend: D = dmv, B = bank, A = advising, P = placeholder
let queues = {
    dmv: [
        { ticketId: "D001", name: "user 1" },
        { ticketId: "D002", name: "user 2" },
        { ticketId: "D003", name: "user 3" }
    ],

    bank: [
        { ticketId: "B001", name: "user 1" },
        { ticketId: "B002", name: "user 2" },
        { ticketId: "B003", name: "user 3" }
    ],

    advising: [
        { ticketId: "A001", name: "user 1" },
        { ticketId: "A002", name: "user 2" },
        { ticketId: "A003", name: "user 3" }
    ],

    placeholder: [
        { ticketId: "P001", name: "user 1" },
        { ticketId: "P002", name: "user 2" },
        { ticketId: "P003", name: "user 3" }
    ]
};

// time for entire queue mainly for admin purposes
const getWaitTime = (req, res) => {
    res.json({
        success: true,
        dmvWaitTime: queues.dmv.length * (serviceConfig.dmv?.duration || 0),
        bankWaitTime: queues.bank.length * (serviceConfig.bank?.duration || 0),
        advisingWaitTime: queues.advising.length * (serviceConfig.advising?.duration || 0),
        placeholderWaitTime: queues.placeholder.length * (serviceConfig.placeholder?.duration || 0),
    });
};

// get all queues
const getQueueList = (req, res) => {
    res.json({ success: true, queues });
};

// logic for serve next user button in QueueManagement
const serveNextUser = (req, res) => {
    const { serviceId } = req.params;       // assinged serviceID to each service

    // check if the service even exists
    if (!queues[serviceId]) {
        return res.status(404).json({ success: false, message: "Service queue not found" });
    }

    // check if service has a queue
    if (queues[serviceId].length === 0) {
        return res.status(400).json({ success: false, message: "Queue is already empty" });
    }

    // "serves" first user by removing them from queue array
    const servedUser = queues[serviceId].shift();

    // return success and info about served user
    res.json({
        success: true,
        message: `Now serving: ${servedUser.name}`,
        servedUser,
        updatedQueue: queues[serviceId]
    });
};

// logic for both move up and move down buttons in QueueManagement
const moveUser = (req, res) => {
    const { serviceId, ticketId } = req.params;     // assinged serviceID and ticketID to each service and user respectively
    const { direction } = req.body;     // direction for move up and down
    const queue = queues[serviceId];

    // checks if there is a queue
    if (!queue){
        return res.status(404).json({ message: "Queue not found" });
    }

    // checks if there is a user to move
    const index = queue.findIndex(u => u.ticketId === ticketId);
    if (index === -1){
        return res.status(404).json({ message: "User not found" });
    }

    // swap logic
    if (direction === 'up' && index > 0) {
        [queue[index], queue[index - 1]] = [queue[index - 1], queue[index]];
    } else if (direction === 'down' && index < queue.length - 1) {
        [queue[index], queue[index + 1]] = [queue[index + 1], queue[index]];
    }

    // return success and info about modified queue
    res.json({ success: true, message: "Queue reordered", updatedQueue: queue });
};

// logic to for remove user button in QueueManagement
const removeUser = (req, res) => {
    const { serviceId, ticketId } = req.params;     // assinged serviceID and ticketID to each service and user respectively
    
    // checks if there is even a queue
    if (!queues[serviceId]){
        return res.status(404).json({ message: "Queue not found" });
    }

    // use filter to creates a new array without the selected user
    queues[serviceId] = queues[serviceId].filter(u => u.ticketId !== ticketId);

    // return success and info about removed user
    res.json({ success: true, message: "User removed" });
};

module.exports = { getWaitTime, getQueueList, serveNextUser, moveUser, removeUser };