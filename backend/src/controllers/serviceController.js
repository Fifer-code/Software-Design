// set default service configuration values, mainly based off was already in frontend
// should match create service form in ServiceManagement page
let serviceConfig = {
    dmv: { 
        name: "DMV Queue 1",
        description: "Standard DMV services",
        duration: 15,
        priority: "Low"
    },

    bank: { 
        name: "Banking Queue 1",
        description: "Teller services",
        duration: 10,
        priority: "Medium"
    },

    advising: {
        name: "Student Advising Queue 1",
        description: "Course planning",
        duration: 30,
        priority: "High"
    },

    placeholder: {
        name: "placeholder",
        description: "placeholder description",
        duration: 5,
        priority: "Low"
    }
};

// starts by getting default configs, but then gets current config for each service if edited
const getService = (req, res) => {
    const servicesArray = Object.entries(serviceConfig).map(([id, data]) => ({
        id,
        name: data.name,
        description: data.description,
        duration: data.duration,
        priority: data.priority
    }));

    res.json({
        success: true,
        services: servicesArray
    });
};

// when creating service, it creates and appends to config object
// assigns parameters by giving each service unique id, name, description, duration, priority
const createService = (req, res) => {
    const { id, name, description, duration, priority } = req.body;

    // checks if there is an id, name, or duration missing
    if (!id || !name || !duration) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // service id is assigned based off parameters 
    serviceConfig[id] = { name, description, duration, priority };

    // returns success and information about newly created service
    res.status(201).json({ success: true, message: "Service created", service: serviceConfig[id] });
};

// uses id to identify and edit/update existing service
const updateService = (req, res) => {
    const { id } = req.params; 
    const { name, description, duration, priority } = req.body;

    // checks if there is a valid service id
    if (!serviceConfig[id]) {
        return res.status(404).json({ success: false, message: "Service not found" });
    }

    // goes through and updates the modified form fields
    if (name){
        serviceConfig[id].name = name;
    }
    if (description){
        serviceConfig[id].description = description;
    }
    if (duration){
        serviceConfig[id].duration = duration;
    }
    if (priority){
        serviceConfig[id].priority = priority;
    }

    // returns success and information about newly updated service
    res.json({ success: true, message: "Service updated", service: serviceConfig[id] });
};

module.exports = { getService, createService, updateService, serviceConfig };