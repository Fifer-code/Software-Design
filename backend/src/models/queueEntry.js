const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema({
  queueId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  position: {
    type: Number,
    required: true,
    min: 1
  },
  joinTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  subCategory: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  status: {
    type: String,
    enum: ['waiting', 'served', 'canceled'],
    default: 'waiting',
    required: true
  }
});

module.exports = mongoose.model('QueueEntry', queueEntrySchema);