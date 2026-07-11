const Challenge = require("../models/Challenge");
const User = require("../models/User");
const { awardPoints } = require("../services/pointsService");
const { config } = require("../config");

// Send a challenge to another (real) user.
exports.sendChallenge = async (req, res, next) => {
  try {
    const { receiver, message, deadline, rated } = req.body;
    const sender = req.userId;

    if (!receiver || !message || !deadline) {
      return res.status(400).json({ error: "Receiver, message and deadline are required" });
    }
    if (String(receiver) === String(sender)) {
      return res.status(400).json({ error: "You cannot challenge yourself" });
    }
    const target = await User.exists({ _id: receiver });
    if (!target) return res.status(404).json({ error: "That user does not exist" });

    const challenge = await Challenge.create({ sender, receiver, message, deadline, rated });
    res.status(201).json({ message: "Challenge sent successfully", challenge });
  } catch (err) {
    next(err);
  }
};

// Challenges involving the current user (sent or received).
exports.getChallenges = async (req, res, next) => {
  try {
    const userId = req.userId;
    const challenges = await Challenge.find({
      $or: [{ receiver: userId }, { sender: userId }],
    })
      .populate("sender receiver", "name email avatar")
      .sort({ createdAt: -1 });
    res.status(200).json(challenges);
  } catch (err) {
    next(err);
  }
};

// Receiver accepts a pending challenge.
exports.acceptChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, receiver: req.userId });
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });
    if (challenge.status !== "pending") {
      return res.status(400).json({ error: `Challenge already ${challenge.status}` });
    }
    challenge.status = "accepted";
    await challenge.save();
    res.status(200).json({ message: "Challenge accepted", challenge });
  } catch (err) {
    next(err);
  }
};

// Receiver rejects a pending challenge.
exports.rejectChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, receiver: req.userId });
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });
    if (challenge.status !== "pending") {
      return res.status(400).json({ error: `Challenge already ${challenge.status}` });
    }
    challenge.status = "rejected";
    await challenge.save();
    res.status(200).json({ message: "Challenge rejected", challenge });
  } catch (err) {
    next(err);
  }
};

// Receiver marks an accepted challenge complete and earns aura (once).
exports.completeChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, receiver: req.userId });
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });
    if (challenge.status === "completed") {
      return res.status(200).json({ message: "Challenge already completed", challenge });
    }
    if (challenge.status !== "accepted") {
      return res.status(400).json({ error: "Accept the challenge before completing it" });
    }

    challenge.status = "completed";
    let aura;
    if (!challenge.pointsAwarded) {
      challenge.pointsAwarded = true;
      aura = await awardPoints(req.userId, config.points.challengeCompleted, "challenge_completed", {
        model: "Challenge",
        id: challenge._id,
      });
    }
    await challenge.save();
    res.status(200).json({
      message: "Challenge completed",
      challenge,
      awarded: challenge.pointsAwarded ? config.points.challengeCompleted : 0,
      aura,
    });
  } catch (err) {
    next(err);
  }
};
