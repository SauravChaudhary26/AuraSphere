const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const schedule = require("node-schedule");

// Import routers
const AuthRouter = require("./routes/authRouter");
const GoalRouter = require("./routes/goalRouter"); // Import the goals router
const MainRouter = require("./routes/mainRouter");

const { updateLeaderboard } = require("./controllers/Leaderboard");
const JwtValidation = require("./middlewares/JwtValidation");

// Supress deprecation warnings
process.noDeprecation = true;

// Connect to the database
require("./db");

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not set

// Middleware setup
// Add Cross-Origin-Opener-Policy header middleware
app.use((req, res, next) => {
   res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
   res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
   next();
});

// Enable CORS and parse JSON bodies
app.use(cors());
app.use(bodyParser.json());

// Define routes
app.use("/", JwtValidation, MainRouter);
app.use("/auth", AuthRouter);
app.use("/goals", GoalRouter); // Add the goals route

// Start the server
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});

// Refresh the leaderboard
schedule.scheduleJob("0 0 * * *", () => {
   console.log("Scheduled leaderboard update triggered");
   updateLeaderboard();
});
