const Service = require('../models/service');
const Queue = require('../models/queue');
const QueueEntry = require('../models/queueEntry');
const { triggerJoinNotification, triggerNearFrontNotification } = require('./notificationController');
const { recordJoin, recordServed, recordRemoved } = require('./historyController');

const PRIORITY_ORDER = { High: 1, Medium: 2, Low: 3 };

// re-sorts waiting entries by priority (High first) then joinTime (earlier first) and reassigns positions
const reorderQueue = async (serviceId) => {
    const entries = await QueueEntry.find({ queueId: serviceId, status: 'waiting' }).sort({ joinTime: 1 });
    entries.sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] || 3;
        const pb = PRIORITY_ORDER[b.priority] || 3;
        if (pa !== pb) return pa - pb;
        return new Date(a.joinTime) - new Date(b.joinTime);
    });
    for (let i = 0; i < entries.length; i++) {
        await QueueEntry.findByIdAndUpdate(entries[i]._id, { position: i + 1 });
    }
};

// time for entire queue mainly for admin purposes
const getWaitTime = async (req, res) => {
  try {
    const services = await Service.find();
    const history = await require('../models/history').find({
      event: { $in: ['joined', 'served'] }
    }).sort({ timestamp: 1 });

    const waitTimes = {};

    for (const service of services) {
      const waitingCount = await QueueEntry.countDocuments({
        queueId: service.serviceId,
        status: 'waiting'
      });

      const serviceHistory = history.filter(
        h => h.serviceId === service.serviceId
      );

      const joinedMap = new Map();
      const historicalWaits = [];

      for (const record of serviceHistory) {
        if (record.event === 'joined') {
          joinedMap.set(record.ticketId, record.timestamp);
        }

        if (record.event === 'served' && joinedMap.has(record.ticketId)) {
          const joinedAt = joinedMap.get(record.ticketId);
          const waitMinutes = (new Date(record.timestamp) - new Date(joinedAt)) / 60000;

          if (waitMinutes >= 0) {
            historicalWaits.push(waitMinutes);
          }
        }
      }

       const recentWaits = historicalWaits.slice(-10);
        

        const minSamples = 1; 

        const historicalAverage =
        recentWaits.length >= minSamples
            ? recentWaits.reduce((sum, w) => sum + w, 0) / recentWaits.length
            : null;


        const fallbackDuration = Number(service.duration) || 10; 
        const estimatedPerPerson = historicalAverage || fallbackDuration;
        
        const totalEstimatedWait = Math.round(waitingCount * estimatedPerPerson);

      waitTimes[service.serviceId] = {
        waitingCount,
        estimatedPerPersonMinutes: Math.round(estimatedPerPerson),
        totalEstimatedWaitMinutes: totalEstimatedWait,
        source: historicalAverage ? 'historical' : 'default-duration'
      };
    }

    res.json({ success: true, waitTimes });
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
            queues[entry.queueId].push({ ticketId: entry.ticketId, name: entry.name, subCategory: entry.subCategory, priority: entry.priority });
        }

        // include queue status for each service so the frontend can display it
        const allQueues = await Queue.find();
        const statuses = {};
        for (const queue of allQueues) {
            statuses[queue.serviceId] = queue.status;
        }

        res.json({ success: true, queues, statuses });
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
        const { name, subCategory } = req.body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ success: false, message: "Invalid name" });
        }

        // checks if service exists in database
        const service = await Service.findOne({ serviceId });
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        // block join if queue is paused or closed
        let queue = await Queue.findOne({ serviceId });
        
        // if queue doesn't exist, create it (handles data inconsistency)
        if (!queue) {
            queue = await Queue.create({ serviceId, status: 'open' });
        }
        
        if (queue.status !== 'open') {
            return res.status(400).json({ success: false, message: `Queue is currently ${queue.status}` });
        }

    const waitingCount = await QueueEntry.countDocuments({
      queueId: serviceId,
      status: 'waiting'
    });

    // use atomic counter on Service to avoid duplicate ticket IDs after deletions
    const updatedService = await Service.findOneAndUpdate(
      { serviceId },
      { $inc: { ticketCounter: 1 } },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const prefix = serviceId.charAt(0).toUpperCase();
    const ticketId = `${prefix}${updatedService.ticketCounter.toString().padStart(3, '0')}`;

    // derive priority from the selected subcategory, default to Low
    let entryPriority = 'Low';
    if (subCategory && updatedService.subcategories?.length) {
        const match = updatedService.subcategories.find(sc => sc.name === subCategory);
        if (match) entryPriority = match.priority;
    }

    const newEntry = await QueueEntry.create({
      queueId: serviceId,
      userId: name.trim(),
      ticketId,
      name: name.trim(),
      subCategory: subCategory || '',
      priority: entryPriority,
      position: waitingCount + 1,
      status: 'waiting'
    });

    // reorder queue to place entry at correct priority position
    await reorderQueue(serviceId);

    // notify the user that they have joined the queue
    triggerJoinNotification(ticketId, name.trim(), serviceId);
    // record join in history
    recordJoin(ticketId, name.trim(), serviceId);

    res.json({
      ticketId: newEntry.ticketId,
      name: newEntry.name,
      subCategory: newEntry.subCategory,
      priority: newEntry.priority,
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

// toggle pause/unpause or explicitly close/open a queue
const updateQueueStatus = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { action } = req.body;

        const validActions = ['toggle', 'close', 'open', 'pause'];
        if (!validActions.includes(action)) {
            return res.status(400).json({ success: false, message: "Invalid action" });
        }

        const queue = await Queue.findOne({ serviceId });
        if (!queue) {
            return res.status(404).json({ success: false, message: "Queue not found" });
        }

        if (action === 'toggle') {
            queue.status = queue.status === 'paused' ? 'open' : 'paused';
        } else if (action === 'pause') {
            queue.status = 'paused';
        } else if (action === 'close') {
            queue.status = 'closed';
            await QueueEntry.deleteMany({ queueId: serviceId, status: 'waiting' });
        } else if (action === 'open') {
            queue.status = 'open';
        }

        await queue.save();
        res.json({ success: true, message: `Queue ${serviceId} is now ${queue.status}`, status: queue.status });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// clears all waiting entries across every queue — intended as an end-of-day action
const clearAllQueues = async (req, res) => {
    try {
        await QueueEntry.deleteMany({ status: 'waiting' });
        res.json({ success: true, message: "All queues cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/queues/:serviceId/subcategory-priority — admin changes a subcategory's priority level
// updates all waiting users in that subcategory and reorders the queue
const updateSubcategoryPriority = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { subCategoryName, newPriority } = req.body;

        if (!subCategoryName || !newPriority) {
            return res.status(400).json({ success: false, message: "subCategoryName and newPriority are required" });
        }
        if (!['Low', 'Medium', 'High'].includes(newPriority)) {
            return res.status(400).json({ success: false, message: "newPriority must be Low, Medium, or High" });
        }

        const service = await Service.findOne({ serviceId });
        if (!service) return res.status(404).json({ success: false, message: "Service not found" });

        const sub = service.subcategories.find(sc => sc.name === subCategoryName);
        if (!sub) return res.status(404).json({ success: false, message: "Subcategory not found" });

        sub.priority = newPriority;
        await service.save();

        // update all waiting queue entries in this subcategory to the new priority
        await QueueEntry.updateMany(
            { queueId: serviceId, subCategory: subCategoryName, status: 'waiting' },
            { priority: newPriority }
        );

        await reorderQueue(serviceId);

        const updatedQueue = await QueueEntry.find({ queueId: serviceId, status: 'waiting' }).sort({ position: 1 });
        res.json({
            success: true,
            message: `${subCategoryName} priority updated to ${newPriority}`,
            updatedQueue: updatedQueue.map(e => ({ ticketId: e.ticketId, name: e.name, subCategory: e.subCategory, priority: e.priority }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/queues/:serviceId/:ticketId/priority — admin overrides a single user's priority
const overrideUserPriority = async (req, res) => {
    try {
        const { serviceId, ticketId } = req.params;
        const { priority } = req.body;

        if (!['Low', 'Medium', 'High'].includes(priority)) {
            return res.status(400).json({ success: false, message: "priority must be Low, Medium, or High" });
        }

        const entry = await QueueEntry.findOne({ queueId: serviceId, ticketId, status: 'waiting' });
        if (!entry) return res.status(404).json({ success: false, message: "User not found in queue" });

        entry.priority = priority;
        await entry.save();

        await reorderQueue(serviceId);

        const updatedQueue = await QueueEntry.find({ queueId: serviceId, status: 'waiting' }).sort({ position: 1 });
        res.json({
            success: true,
            message: `${entry.name}'s priority overridden to ${priority}`,
            updatedQueue: updatedQueue.map(e => ({ ticketId: e.ticketId, name: e.name, subCategory: e.subCategory, priority: e.priority }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// used by tests to reset queue state between runs
const resetQueues = async () => {
    await QueueEntry.deleteMany({});
};

module.exports = { getWaitTime, getQueueList, serveNextUser, moveUser, removeUser, joinQueue, resetQueues, updateQueueStatus, clearAllQueues, updateSubcategoryPriority, overrideUserPriority };
