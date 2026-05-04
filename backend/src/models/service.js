const mongoose = require('mongoose');

const serviceSchema =  new mongoose.Schema(
    {
        serviceId:{
            type: String,        // string to make id be dmv, banking, or advising
            required: true,
            maxlength: [50, 'Service ID cannot exceed 50 characters']
        },
        name:{
            type: String,
            required: true,
            unique: true,       // only allow 1 service with same name
            maxlength: [100, 'Service name cannot exceed 100 characters']
        },
        description:{
            type: String,
            maxlength: [300, 'Description cannot exceed 300 characters']
        },
        duration:{
            type: Number,
            required: true,
            min: [1, 'Duration must be at least 1 minute']
        },
        priority:{
            type: String,
            required: true,
            enum: ['Low', 'Medium', 'High']
        },
        category:{
            type: String,
            enum: ['DMV', 'Banking', 'Student Advising']
        },
        subcategories: [{
            name: {
                type: String,
                required: true,
                maxlength: [100, 'Subcategory name cannot exceed 100 characters']
            },
            priority: {
                type: String,
                enum: ['Low', 'Medium', 'High'],
                default: 'Low'
            }
        }],
        ticketCounter:{
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema)