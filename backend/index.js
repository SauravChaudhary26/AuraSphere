const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

// Import routers
const AuthRouter = require("./routes/authRouter");

// Load environment variables
dotenv.config();

// Connect to the database
require("./db");

// Initialize the Express application
const app = express();
const PORT = process.env.PORT;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get("/ping", (req, res) => {
    res.send("PONG");
});

// Define routes
app.use("/auth", AuthRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
