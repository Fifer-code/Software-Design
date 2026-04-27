const bcrypt = require('bcryptjs');
const Service = require('../models/service');
const Queue = require('../models/queue');
const UserCredentials = require('../models/userCredentials');
const UserProfile = require('../models/userProfile');

const defaultServices = [
    {
        serviceId: 'dmv',
        name: 'DMV',
        description: 'Join queue to renew Drivers License with clerk',
        duration: 15,
        priority: 'Low',
        category: 'DMV'
    },
    {
        serviceId: 'bank',
        name: 'Banking',
        description: 'Join queue to make Cash Deposit / Withdrawal with teller',
        duration: 10,
        priority: 'Medium',
        category: 'Banking'
    },
    {
        serviceId: 'advising',
        name: 'Student Advising',
        description: 'Join queue for Course Planning with advisor',
        duration: 30,
        priority: 'High',
        category: 'Student Advising'
    },
];

const testAccounts = [
    {
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        fullName: 'Test Admin'
    },
    {
        email: 'user@test.com',
        password: 'user123',
        role: 'user',
        fullName: 'Test User'
    }
];

const seedDatabase = async () => {
    // seed default services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
        for (const serviceData of defaultServices) {
            await Service.create(serviceData);
            await Queue.create({ serviceId: serviceData.serviceId, status: 'open' });
        }
        console.log('default services and queues added to database');
    }

    // seed test accounts
    for (const account of testAccounts) {
        const exists = await UserCredentials.findOne({ email: account.email });
        if (!exists) {
            const passwordHash = await bcrypt.hash(account.password, 10);
            const cred = await UserCredentials.create({
                email: account.email,
                passwordHash,
                role: account.role
            });
            await UserProfile.create({
                credentialId: cred._id,
                fullName: account.fullName,
                email: account.email,
                contactInfo: '',
                preferences: {}
            });
            console.log(`test ${account.role} account created: ${account.email}`);
        }
    }
};

module.exports = seedDatabase;
