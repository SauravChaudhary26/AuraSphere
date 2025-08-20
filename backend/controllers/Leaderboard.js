const UserModel = require("../models/User");

let leaderboardCache = {
    ranks: [],
    lastUpdated: null,
};

const runLeaderboardUpdate = async () => {
    try {
        const leaderboardData = await UserModel.find()
            .sort({ aura: -1 })
            .limit(10);

        const newList = leaderboardData.map((item) => ({
            name: item.name,
            aura: item.aura,
        }));

        leaderboardCache.ranks = newList;
        leaderboardCache.lastUpdated = new Date();

        console.log("Leaderboard was updated successfully");
    } catch (error) {
        console.error("Error while updating the leaderboard: ", error);
    }
};

// Route handler
const updateLeaderboard = async (req, res) => {
    const cronSecret = req.headers["x-cron-secret"];
    if (cronSecret !== process.env.CRON_SECRET) {
        return res.status(403).send("Forbidden");
    }

    await runLeaderboardUpdate();
    res.send("Leaderboard updated");
};

// Route handler to serve the leaderboard
const leaderboard = async (req, res) => {
    console.log("Leaderboard was accessed");
    try {
        if (leaderboardCache.ranks.length === 0) {
            return res.status(404).json({
                message: "No leaderboard data found",
                success: false,
            });
        }

        res.status(200).json({
            userData: leaderboardCache.ranks,
            success: true,
            message: "Data fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching leaderboard data:", error.message);
        res.status(500).json({
            message: "Leaderboard inaccessible",
            success: false,
        });
    }
};

//Run once when server starts
runLeaderboardUpdate();

module.exports = {
    leaderboard,
    updateLeaderboard,
    runLeaderboardUpdate,
};