const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    ticketId: {
        type: String,
        required: [true, 'Ticket ID is required'],
        maxlength: [20, 'Ticket ID cannot exceed 20 characters']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    serviceId: {
        type: String,
        required: [true, 'Service ID is required'],
        maxlength: [50, 'Service ID cannot exceed 50 characters']
    },
    event: {
        type: String,
        enum: ['joined', 'served', 'removed'],
        required: [true, 'Event type is required']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.History || mongoose.model('History', historySchema);
