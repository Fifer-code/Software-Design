// also used npm install axios in frontend folder
// seting up express
const express = require('express');
const app = express();
const cors = require("cors");       // used npm i cors
const corsOptions = {
    origin: ["http://localhost:5173"]
};

// gemini fix : Add this line to actively apply the CORS middleware to your app
app.use(cors(corsOptions));

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

// listen to requests, output if server started
app.listen(8080, () => {
    console.log("Server started on port 8080");
});