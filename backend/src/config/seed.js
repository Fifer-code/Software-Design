const bcrypt = require('bcryptjs');
const Service = require('../models/service');
const Queue = require('../models/queue');
const UserCredentials = require('../models/userCredentials');
const UserProfile = require('../models/userProfile');
const QueueEntry = require('../models/queueEntry');
const History = require('../models/history');
const Feedback = require('../models/feedback');

const defaultServices = [
    {
        serviceId: 'dmv',
        name: 'License Renewal',
        description: 'Renew your drivers license with a clerk',
        duration: 15,
        priority: 'Low',
        category: 'DMV'
    },
    {
        serviceId: 'dmv_id',
        name: 'ID Registration',
        description: 'Apply for or renew your state ID with a clerk',
        duration: 20,
        priority: 'Low',
        category: 'DMV'
    },
    {
        serviceId: 'dmv_title',
        name: 'Title Transfers',
        description: 'Transfer your vehicle title with a clerk',
        duration: 25,
        priority: 'Medium',
        category: 'DMV'
    },
    {
        serviceId: 'bank',
        name: 'Cash Deposits / Withdrawals',
        description: 'Make cash deposits or withdrawals with a teller',
        duration: 10,
        priority: 'Medium',
        category: 'Banking'
    },
    {
        serviceId: 'bank_account',
        name: 'Open New Account',
        description: 'Open a new checking or savings account with a banker',
        duration: 20,
        priority: 'Medium',
        category: 'Banking'
    },
    {
        serviceId: 'bank_loan',
        name: 'Apply for a Loan',
        description: 'Apply for a loan with a loan officer',
        duration: 30,
        priority: 'High',
        category: 'Banking'
    },
    {
        serviceId: 'advising',
        name: 'Course Planning',
        description: 'Plan your upcoming semester courses with an advisor',
        duration: 30,
        priority: 'High',
        category: 'Student Advising'
    },
    {
        serviceId: 'advising_drop',
        name: 'Drop or Add Classes',
        description: 'Drop or add classes this semester with an advisor',
        duration: 20,
        priority: 'Medium',
        category: 'Student Advising'
    },
    {
        serviceId: 'advising_aid',
        name: 'Financial Aid Counseling',
        description: 'Review your financial aid options with a counselor',
        duration: 45,
        priority: 'High',
        category: 'Student Advising'
    }
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

const historySlots = [
    {
        daysBack: 4,
        hour: 9
    },
    {
        daysBack: 3,
        hour: 11
    },
    {
        daysBack: 2,
        hour: 14
    },
    {
        daysBack: 1,
        hour: 10
    }
];

const feedbackEntries = [
    {
        rating: 5,
        comment: 'Really smooth process, barely waited at all!'
    },
    {
        rating: 4,
        comment: 'Pretty quick, staff was super helpful'
    },
    {
        rating: 3,
        comment: 'Wait was a bit long but overall fine'
    },
    {
        rating: 5,
        comment: 'Love how easy this is to use'
    },
    {
        rating: 2,
        comment: 'Took longer than expected, could be better'
    },
    {
        rating: 4,
        comment: 'Good experience, no complaints'
    },
    {
        rating: 1,
        comment: 'Waited way too long, very frustrating'
    },
    {
        rating: 5,
        comment: 'Great system, keeps everything organized'
    }
];

// ticket number start per service keeps ticketIds globally unique across all QueueEntry docs
// services sharing a prefix letter (D, B, A) need separate number ranges to avoid collisions
const ticketStart = {
    'dmv': 1,
    'dmv_id': 101,
    'dmv_title': 201,
    'bank': 1,
    'bank_account': 101,
    'bank_loan': 201,
    'advising': 1,
    'advising_drop': 101,
    'advising_aid': 201
};

const buildSeedUserName = (queueName, serviceName, index) => `${queueName} - ${serviceName} User ${index}`;
const PRIORITY_ORDER = { High: 1, Medium: 2, Low: 3 };

const resequenceSeededQueue = async (queueId) => {
    const waitingEntries = await QueueEntry.find({ queueId, status: 'waiting' }).sort({ joinTime: 1, ticketId: 1 });
    waitingEntries.sort((left, right) => {
        const leftPriority = PRIORITY_ORDER[left.priority] || 3;
        const rightPriority = PRIORITY_ORDER[right.priority] || 3;

        if (leftPriority !== rightPriority) {
            return leftPriority - rightPriority;
        }

        const leftTime = new Date(left.joinTime).getTime();
        const rightTime = new Date(right.joinTime).getTime();
        if (leftTime !== rightTime) {
            return leftTime - rightTime;
        }

        return left.ticketId.localeCompare(right.ticketId);
    });

    for (let index = 0; index < waitingEntries.length; index++) {
        await QueueEntry.findByIdAndUpdate(waitingEntries[index]._id, { position: index + 1 });
    }
};

const seedDatabase = async () => {
    // seed services and queues
    for (const serviceData of defaultServices) {
        const exists = await Service.findOne({ serviceId: serviceData.serviceId });
        if (!exists) {
            await Service.create(serviceData);
            const queueId = serviceData.category || serviceData.serviceId;
            const queueExists = await Queue.findOne({ serviceId: queueId });
            if (!queueExists) {
                await Queue.create({ serviceId: queueId, status: 'open' });
            }
            console.log(`service created: ${serviceData.name}`);
        }
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

    // seed 5 waiting users per service using that service's priority
    const queueEntryCount = await QueueEntry.countDocuments();
    if (queueEntryCount === 0) {
        for (const serviceData of defaultServices) {
            const start = ticketStart[serviceData.serviceId];
            const prefix = serviceData.serviceId.charAt(0).toUpperCase();
            const queueId = serviceData.category || serviceData.serviceId;

            for (let i = 0; i < 5; i++) {
                const userName = buildSeedUserName(serviceData.category, serviceData.name, i + 1);
                const ticketId = `${prefix}${(start + i).toString().padStart(3, '0')}`;
                await QueueEntry.create({
                    queueId,
                    serviceId: serviceData.serviceId,
                    userId: userName,
                    ticketId: ticketId,
                    name: userName,
                    position: i + 1,
                    priority: serviceData.priority,
                    joinTime: new Date(),
                    status: 'waiting'
                });
            }
            // set ticketCounter past all seeded entries so next real join does not collide
            await Service.updateOne({ serviceId: serviceData.serviceId }, { ticketCounter: start + 19 });
        }

        for (const queueId of ['DMV', 'Banking', 'Student Advising']) {
            await resequenceSeededQueue(queueId);
        }

        console.log('queue entries seeded');
    }

    // seed history - 4 joined+served pairs and 1 joined+removed pair per service
    const historyCount = await History.countDocuments();
    if (historyCount === 0) {
        for (const serviceData of defaultServices) {
            const start = ticketStart[serviceData.serviceId];
            const prefix = serviceData.serviceId.charAt(0).toUpperCase();

            for (let i = 0; i < 4; i++) {
                const ticketId = `${prefix}${(start + 10 + i).toString().padStart(3, '0')}`;
                const name = buildSeedUserName(serviceData.category, serviceData.name, 11 + i);
                const joinedAt = new Date();
                joinedAt.setDate(joinedAt.getDate() - historySlots[i].daysBack);
                joinedAt.setHours(historySlots[i].hour, 0, 0, 0);
                const servedAt = new Date(joinedAt.getTime() + serviceData.duration * 60000);
                await History.create({
                    ticketId: ticketId,
                    name: name,
                    serviceId: serviceData.serviceId,
                    event: 'joined',
                    message: `${name} joined the ${serviceData.name} queue`,
                    timestamp: joinedAt
                });
                await History.create({
                    ticketId: ticketId,
                    name: name,
                    serviceId: serviceData.serviceId,
                    event: 'served',
                    message: `${name} was served at ${serviceData.name}`,
                    timestamp: servedAt
                });
            }

            const removedTicketId = `${prefix}${(start + 14).toString().padStart(3, '0')}`;
            const removedName = buildSeedUserName(serviceData.category, serviceData.name, 15);
            const removedJoinedAt = new Date();
            removedJoinedAt.setDate(removedJoinedAt.getDate() - 2);
            removedJoinedAt.setHours(13, 0, 0, 0);
            const removedAt = new Date(removedJoinedAt.getTime() + 5 * 60000);
            await History.create({
                ticketId: removedTicketId,
                name: removedName,
                serviceId: serviceData.serviceId,
                event: 'joined',
                message: `${removedName} joined the ${serviceData.name} queue`,
                timestamp: removedJoinedAt
            });
            await History.create({
                ticketId: removedTicketId,
                name: removedName,
                serviceId: serviceData.serviceId,
                event: 'removed',
                message: `${removedName} was removed from the ${serviceData.name} queue`,
                timestamp: removedAt
            });
        }
        console.log('history seeded');
    }

    // seed 8 casual feedback entries
    const feedbackCount = await Feedback.countDocuments();
    if (feedbackCount === 0) {
        for (const entry of feedbackEntries) {
            await Feedback.create(entry);
        }
        console.log('feedback seeded');
    }
};

module.exports = seedDatabase;
