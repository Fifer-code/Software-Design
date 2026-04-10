const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);