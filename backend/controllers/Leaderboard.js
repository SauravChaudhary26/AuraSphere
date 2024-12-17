const UserModel = require("../models/User");

let leaderboardCache = {
  ranks: [],
  lastUpdated: null,
};

const updateLeaderboard = async () => {
  // console.log("Update leaderboard was called");

  try {
    const leaderboardData = await UserModel.find().sort({ aura: -1 }).limit(10);
    const newList = leaderboardData.map((item) => {
      return { name: item.name, aura: item.aura };
    });
    leaderboardCache.ranks = newList;
    leaderboardCache.lastUpdated = new Date();
    // console.log(leaderboardCache);
    console.log("LeaderBoard was updated successfully");
  } catch (error) {
    console.log("Error while updating the leaderboard: ", error);
  }
};

const leaderboard = async (req, res) => {
  console.log("LeaderBoard was accesed");
  try {
    if (leaderboardCache.ranks.length === 0) {
      // Handle case when no data is found
      return res
        .status(404)
        .json({ message: "No leaderboard data found", success: false });
    }
    // console.log(leaderboardCache.ranks);
    res.status(200).json({
      userData: leaderboardCache.ranks,
      success: true,
      message: "Data fetched successfully",
    }); // Send the data as a JSON response
  } catch (error) {
    console.error("Error fetching leaderboard data:", error.message);
    res
      .status(500)
      .json({ message: "Leaderboard inaccessible", success: false }); // Send an error response
  }
};

updateLeaderboard();

module.exports = {
  leaderboard,
  updateLeaderboard,
};
