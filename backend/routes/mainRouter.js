const router = require("express").Router();
const { leaderboard } = require("../controllers/Leaderboard");
const timetableRouter = require("./timetableRouter");
const courseRouter = require("./courseRouter");
const assignmentRouter = require("./assignmentRouter");
const GoalRouter = require("./goalRouter");
const userRouter = require("./userRouter");
const challengeRouter = require("./challengeRouter");

// Test route
router.get("/test", (req, res) => {
   res.send("SERVER IS RUNNING FINE");
});

router.use("/goals", GoalRouter);
router.use("/leaderboard", leaderboard);
router.use("/users", userRouter);
router.use("/timetable", timetableRouter);
router.use("/courses", courseRouter);
router.use("/assignments", assignmentRouter);
router.use("/challenges", challengeRouter);

module.exports = router;
