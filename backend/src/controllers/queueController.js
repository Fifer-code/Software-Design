const Service = require('../models/service');
const Queue = require('../models/queue');
const QueueEntry = require('../models/queueEntry');
const { triggerJoinNotification, triggerNearFrontNotification } = require('./notificationController');
const { recordJoin, recordServed, recordRemoved } = require('./historyController');

// time for entire queue mainly for admin purposes
const getWaitTime = async (req, res) => {
    try {
        const services = await Service.find();
        const waitTimes = {};

        // loop through each service and count how many people are waiting
        for (const service of services) {
            const count = await QueueEntry.countDocuments({ queueId: service.serviceId, status: 'waiting' });
            waitTimes[`${service.serviceId}WaitTime`] = count * service.duration;
        }

        res.json({ success: true, ...waitTimes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// get all queues
const getQueueList = async (req, res) => {
    try {
        // get all waiting entries from db sorted by position
        const entries = await QueueEntry.find({ status: 'waiting' }).sort({ position: 1 });

        // group entries by service id to match the same format the frontend expects
        const queues = {};
        for (const entry of entries) {
            if (!queues[entry.queueId]) queues[entry.queueId] = [];
            queues[entry.queueId].push({ ticketId: entry.ticketId, name: entry.name });
        }

        res.json({ success: true, queues });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// logic for serve next user button in QueueManagement
const serveNextUser = async (req, res) => {
    try {
        const { serviceId } = req.params;       // assigned serviceID to each service

        // check if the service even exists
        const service = await Service.findOne({ serviceId });
        if (!service) {
            return res.status(404).json({ success: false, message: "Service queue not found" });
        }

        // find the first waiting user and mark them as served
        const servedUser = await QueueEntry.findOneAndUpdate(
            { queueId: serviceId, status: 'waiting' },
            { status: 'served' },
            { sort: { position: 1 }, new: false }
        );

        // check if queue is already empty
        if (!servedUser) {
            return res.status(400).json({ success: false, message: "Queue is already empty" });
        }

        // record served user in history
        recordServed(servedUser.ticketId, servedUser.name, serviceId);

        // notify the next users in line that they are close to being served
        const remaining = await QueueEntry.find({ queueId: serviceId, status: 'waiting' }).sort({ position: 1 });
        if (remaining[0]) triggerNearFrontNotification(remaining[0].ticketId, remaining[0].name, serviceId, 1);
        if (remaining[1]) triggerNearFrontNotification(remaining[1].ticketId, remaining[1].name, serviceId, 2);

        // return success and info about served user
        res.json({
            success: true,
            message: `Now serving: ${servedUser.name}`,
            servedUser: { ticketId: servedUser.ticketId, name: servedUser.name },
            updatedQueue: remaining.map(e => ({ ticketId: e.ticketId, name: e.name }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// logic for both move up and move down buttons in QueueManagement
const moveUser = async (req, res) => {
    try {
        const { serviceId, ticketId } = req.params;     // assigned serviceID and ticketID to each service and user
        const { direction } = req.body;     // direction for move up and down

        // checks if there is a valid queue
        const service = await Service.findOne({ serviceId });
        if (!service) {
            return res.status(404).json({ message: "Queue not found" });
        }

        // checks if there is a user to move
        const user = await QueueEntry.findOne({ queueId: serviceId, ticketId, status: 'waiting' });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // find the adjacent user based on direction then swap positions
        let adjacent;
        if (direction === 'up') {
            adjacent = await QueueEntry.findOne({ queueId: serviceId, status: 'waiting', position: user.position - 1 });
        } else if (direction === 'down') {
            adjacent = await QueueEntry.findOne({ queueId: serviceId, status: 'waiting', position: user.position + 1 });
        }

        // swap logic
        if (adjacent) {
            const tempPos = user.position;
            await QueueEntry.findByIdAndUpdate(user._id, { position: adjacent.position });
            await QueueEntry.findByIdAndUpdate(adjacent._id, { position: tempPos });
        }

        // return success and info about modified queue
        const updatedQueue = await QueueEntry.find({ queueId: serviceId, status: 'waiting' }).sort({ position: 1 });
        res.json({
            success: true,
            message: "Queue reordered",
            updatedQueue: updatedQueue.map(e => ({ ticketId: e.ticketId, name: e.name }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// logic for remove user button in QueueManagement
const removeUser = async (req, res) => {
    try {
        const { serviceId, ticketId } = req.params;     // assigned serviceID and ticketID to each service and user

        // checks if there is even a queue
        const service = await Service.findOne({ serviceId });
        if (!service) {
            return res.status(404).json({ message: "Queue not found" });
        }

        // find user before removing so we can record their name in history
        const entry = await QueueEntry.findOneAndUpdate(
            { queueId: serviceId, ticketId, status: 'waiting' },
            { status: 'canceled' },
            { new: false }
        );

        // record removal in history if user was found
        if (entry) recordRemoved(ticketId, entry.name, serviceId);

        // return success and info about removed user
        res.json({ success: true, message: "User removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// logic for join queue button in UserDashboard
const joinQueue = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { name } = req.body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ success: false, message: "Invalid name" });
        }

        // checks if service exists in database
        const service = await Service.findOne({ serviceId });
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

    const waitingCount = await QueueEntry.countDocuments({
      queueId: serviceId,
      status: 'waiting'
    });

    // generate ticket ID
    const prefix = serviceId.charAt(0).toUpperCase();
    const ticketNumber = waitingCount + 1;
    const ticketId = `${prefix}${ticketNumber.toString().padStart(3, '0')}`;

    const newEntry = await QueueEntry.create({
      queueId: serviceId,
      userId: name.trim(),
      ticketId,
      name: name.trim(),
      position: waitingCount + 1,
      status: 'waiting'
    });

    // notify the user that they have joined the queue
    triggerJoinNotification(ticketId, name.trim(), serviceId);
    // record join in history
    recordJoin(ticketId, name.trim(), serviceId);

    res.json({
      ticketId: newEntry.ticketId,
      name: newEntry.name,
      serviceId,
      status: newEntry.status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// used by tests to reset queue state between runs
const resetQueues = async () => {
    await QueueEntry.deleteMany({});
};

module.exports = { getWaitTime, getQueueList, serveNextUser, moveUser, removeUser, joinQueue, resetQueues };
