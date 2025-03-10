const express = require("express");
const {
   sendChallenge,
   getChallenges,
   acceptChallenge,
   rejectChallenge,
   completeChallenge,
} = require("../controllers/challengeController");

const router = express.Router();

// All routes now use JwtValidation
router.post("/", sendChallenge); // Send a challenge
router.get("/", getChallenges); // Get all challenges for the user
router.put("/:id/accept", acceptChallenge); // Accept a challenge
router.put("/:id/reject", rejectChallenge); // Reject a challenge
router.put("/:id/complete", completeChallenge); // Mark a challenge as completed

module.exports = router;
