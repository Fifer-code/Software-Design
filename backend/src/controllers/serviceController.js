const Service = require('../models/service');
const Queue = require('../models/queue');
const QueueEntry = require('../models/queueEntry');

// gets all services from the database
const getService = async (req, res) => {
    try {
        const services = await Service.find();
        const servicesArray = services.map(s => ({
            id: s.serviceId,
            name: s.name,
            description: s.description,
            duration: s.duration,
            priority: s.priority,
            category: s.category,
            subcategories: s.subcategories || []
        }));
        res.json({ success: true, services: servicesArray });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// creates a new service and saves it to the database
const createService = async (req, res) => {
    try {
        const { id, name, description, duration, priority, category, subcategories } = req.body;

        // checks if there is an id, name, or duration missing
        if (!id || !name || !duration) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const service = await Service.create({ serviceId: id, name, description, duration, priority, category, subcategories: subcategories || [], ticketCounter: 0 });

        // create an open queue for this service (assignment requirement: Queue tracks status per service)
        await Queue.create({ serviceId: id, status: 'open' });

        res.status(201).json({ success: true, message: "Service created", service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// finds a service by serviceId and updates the modified fields
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, duration, priority, category, subcategories } = req.body;

        // build update object with only the fields that were provided
        const updates = {};
        if (name) updates.name = name;
        if (description) updates.description = description;
        if (duration) updates.duration = duration;
        if (priority) updates.priority = priority;
        if (category) updates.category = category;
        if (subcategories !== undefined) updates.subcategories = subcategories;

        const service = await Service.findOneAndUpdate(
            { serviceId: id },
            updates,
            { new: true }  // return the updated document
        );

        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        res.json({ success: true, message: "Service updated", service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findOneAndDelete({ serviceId: id });
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        await Queue.deleteMany({ serviceId: id });
        await QueueEntry.deleteMany({ queueId: id });
        res.json({ success: true, message: "Service deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getService, createService, updateService, deleteService };