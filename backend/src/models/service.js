const mongoose = require('mongoose');

const serviceSchema =  new mongoose.Schema(
    {
        serviceId:{
            type: String,        // string to make id be dmv, banking, or advising
            required: true,
        },
        name:{
            type: String,
            required: true,
            unique: true,       // only allow 1 queue with same name
        },
        description:{
            type: String,
        },
        duration:{
            type: Number,
            required: true
        },
        priority:{
            type: String,
            required: true,
            enum: ['Low', 'Medium', 'High']
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema)