const express = require("express");
const router = express.Router();

let feedbacks = [];
let idCounter = 1;


router.post("/", (req, res) => {

    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (comment && comment.length > 500) {
        return res.status(400).json({ error: "Comment too long" });
    }

    const newFeedback = {
        id: idCounter++,
        rating,
        comment: comment || "",
        createdAt: new Date()
    };

    feedbacks.push(newFeedback);

    res.status(201).json(newFeedback);
});


router.get("/", (req, res) => {
    res.json(feedbacks);
});

module.exports = router;