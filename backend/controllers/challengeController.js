const Challenge = require("../models/Challenge");

// Send a Challenge
exports.sendChallenge = async (req, res) => {
   try {
      const { receiver, message, deadline, rated } = req.body;
      const sender = req.userId; // Extracted from JwtValidation

      if (!receiver || !message || !deadline) {
         return res.status(400).json({ error: "All fields are required" });
      }

      const challenge = new Challenge({
         sender,
         receiver,
         message,
         deadline,
         rated,
      });

      await challenge.save();
      res.status(201).json({
         message: "Challenge sent successfully",
         challenge,
      });
   } catch (error) {
      res.status(500).json({ error: "Server error" });
   }
};

// Get Challenges for the logged-in user
exports.getChallenges = async (req, res) => {
   try {
      const userId = req.userId;
      const challenges = await Challenge.find({
         $or: [{ receiver: userId }, { sender: userId }],
      }).populate("sender receiver", "name email");

      res.status(200).json(challenges);
   } catch (error) {
      console.log(error);

      res.status(500).json({ error: "Server error" });
   }
};

// Accept a Challenge
exports.acceptChallenge = async (req, res) => {
   try {
      const { id } = req.params;
      const userId = req.userId;

      console.log("id ", id);
      console.log("userId ", userId);

      const challenge = await Challenge.findById(id);
      if (!challenge || challenge.receiver.toString() !== userId) {
         return res
            .status(404)
            .json({ error: "Challenge not found or not authorized" });
      }

      challenge.status = "accepted";
      await challenge.save();
      res.status(200).json({ message: "Challenge accepted", challenge });
   } catch (error) {
      res.status(500).json({ error: "Server error" });
   }
};

// Reject a Challenge
exports.rejectChallenge = async (req, res) => {
   try {
      const { id } = req.params;
      const userId = req.userId;

      const challenge = await Challenge.findById(id);
      if (!challenge || challenge.receiver.toString() !== userId) {
         return res
            .status(404)
            .json({ error: "Challenge not found or not authorized" });
      }

      challenge.status = "rejected";
      await challenge.save();
      res.status(200).json({ message: "Challenge rejected", challenge });
   } catch (error) {
      res.status(500).json({ error: "Server error" });
   }
};

// Complete a Challenge
exports.completeChallenge = async (req, res) => {
   try {
      const { id } = req.params;
      const userId = req.userId;

      const challenge = await Challenge.findById(id);
      if (!challenge || challenge.sender.toString() !== userId) {
         return res
            .status(404)
            .json({ error: "Challenge not found or not authorized" });
      }

      challenge.status = "completed";
      await challenge.save();
      res.status(200).json({ message: "Challenge completed", challenge });
   } catch (error) {
      res.status(500).json({ error: "Server error" });
   }
};
