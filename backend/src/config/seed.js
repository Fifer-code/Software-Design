const Service = require('../models/service');
const Queue = require('../models/queue');

// same default services that were hardcoded before, now seeded into the database
const defaultServices = [
    {
        serviceId: 'dmv',
        name: 'DMV Queue 1',
        description: 'Standard DMV services',
        duration: 15,
        priority: 'Low'
    },
    {
        serviceId: 'bank',
        name: 'Banking Queue 1',
        description: 'Teller services',
        duration: 10,
        priority: 'Medium'
    },
    {
        serviceId: 'advising',
        name: 'Student Advising Queue 1',
        description: 'Course planning',
        duration: 30,
        priority: 'High'
    },
    {
        serviceId: 'placeholder',
        name: 'placeholder',
        description: 'placeholder description',
        duration: 5,
        priority: 'Low'
    }
];

const seedDatabase = async () => {
    const count = await Service.countDocuments();

    // if no services exist yet, add the defaults so the app isnt empty on startup
    if (count === 0) {
        for (const serviceData of defaultServices) {
            await Service.create(serviceData);
            await Queue.create({ serviceId: serviceData.serviceId, status: 'open' });
        }
        console.log('default services and queues added to database');
    }
};

module.exports = seedDatabase;
