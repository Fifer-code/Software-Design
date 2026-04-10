// also used npm install axios in frontend folder
// seting up express
const express = require('express');
const app = express();
const cors = require("cors");       // used npm i cors
const authRoutes = require('./src/routes/authRoutes.js');
const connectDB = require('./src/config/db.js');
const seedDatabase = require('./src/config/seed.js');

const corsOptions = {
    origin: ["http://localhost:5173"]
};

// gemini fix : Add this line to actively apply the CORS middleware to your app
app.use(cors(corsOptions));
app.use(express.json());  // Parse JSON request bodies

// connect to database then seed default data if needed
connectDB()
    .then(() => seedDatabase())
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    });

// Routes
app.use('/auth', authRoutes);

// testing with array
app.get("/api", (req, res) => {
    res.json({
        "fruits": [
            "appple",
            "orange",
            "banana"
        ]
    })
});

// must be at the top of route connections
app.use(express.json());

// connect queue routes
const queueRoutes = require('./src/routes/queueRoutes');
app.use('/api/queues', queueRoutes);

// connect service routes
const serviceRoutes = require('./src/routes/serviceRoutes');
app.use('/api/services', serviceRoutes);

// connect feedback routes
const feedbackRoutes = require('./src/routes/feedbackRoutes');
app.use('/api/feedback', feedbackRoutes);

// connect notification routes
const notificationRoutes = require('./src/routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// connect history routes
const historyRoutes = require('./src/routes/historyRoutes');
app.use('/api/history', historyRoutes);



// listen to requests, output if server started
app.listen(8080, () => {
    console.log("Server started on port 8080");
});