const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
    {
        serviceId: {
            type: String,
            required: true,
            maxlength: [50, 'Service ID cannot exceed 50 characters']
        },
        status: {
            type: String,
            enum: ['open', 'closed'],
            default: 'open',
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Queue || mongoose.model('Queue', queueSchema)