const router = require("express").Router();
const { leaderboard } = require("../controllers/Leaderboard");
const JwtValidation = require("../middlewares/JwtValidation");
const timetableRouter = require("./timetableRouter");
const courseRouter = require("./courseRouter");
const assignmentRouter = require("./assignmentRouter");

// Test route
router.get("/test", (req, res) => {
   res.send("SERVER IS RUNNING FINE");
});

//LeaderBoard route
router.get("/leaderboard", JwtValidation, leaderboard);
router.get("")
router.use("/timetable", timetableRouter);
router.use("/courses", courseRouter);
router.use("/assignments", assignmentRouter);

module.exports = router;
