const Feedback = require('../models/feedback');

const createFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const newFeedback = await Feedback.create({
      rating,
      comment: comment || ""
    });

    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createFeedback, getAllFeedback };