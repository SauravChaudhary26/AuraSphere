const router = require("express").Router();
const { leaderboard } = require("../controllers/Leaderboard");
const timetableRouter = require("./timetableRouter");
const courseRouter = require("./courseRouter");
const assignmentRouter = require("./assignmentRouter");
const GoalRouter = require("./goalRouter");
const userRouter = require("./userRouter");
const challengeRouter = require("./challengeRouter");
const leaderboardRouter = require("./leaderboardRouter");
const pointsRouter = require("./pointsRouter");
const issueRouter = require("./issueRouter");

router.use("/goals", GoalRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/users", userRouter);
router.use("/timetable", timetableRouter);
router.use("/courses", courseRouter);
router.use("/assignments", assignmentRouter);
router.use("/challenges", challengeRouter);
router.use("/points", pointsRouter);
router.use("/issues", issueRouter);

module.exports = router;
