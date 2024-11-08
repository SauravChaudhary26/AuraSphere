const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

// Import routers
const AuthRouter = require("./routes/authRouter");
const GoalRouter = require("./routes/goalRouter"); // Import the goals router

// Load environment variables
dotenv.config();

// Connect to the database
require("./db");

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not set

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get("/test", (req, res) => {
    res.send("SERVER IS RUNNING FINE");
});

// Define routes
app.use("/auth", AuthRouter);
app.use("/goals", GoalRouter); // Add the goals route

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
