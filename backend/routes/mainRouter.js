const { leaderboard } = require("../controllers/Leaderboard");
const JwtValidation = require("../middlewares/JwtValidation");
const router = require("express").Router();
const timetableRouter = require("./timetableRouter");

// Test route
router.get("/test", (req, res) => {
   res.send("SERVER IS RUNNING FINE");
});

//LeaderBoard route
router.get("/leaderboard", JwtValidation, leaderboard);
router.use("/timetable", timetableRouter);

module.exports = router;
