const { awardPoints } = require("../../services/pointsService");
const AuraTransaction = require("../../models/AuraTransaction");
const { config } = require("../../config");
const { DAILY_AWARD_CAP } = require("./constants");

function startOfLocalDay(now = new Date()) {
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  return day;
}

// The cap check is read-then-write against Mongo; focus phases completing in
// different rooms at the same moment could both read a pre-cap count. Chaining
// per-user award work through this map serializes them (single process — the
// same boundary as the room store itself).
const inFlightByUser = new Map(); // userId -> tail of that user's award chain

async function awardOne(userId, { emitToUser, notifyCapReached }) {
  const awardedToday = await AuraTransaction.countDocuments({
    userId,
    reason: "study_session_completed",
    createdAt: { $gte: startOfLocalDay() },
  });
  if (awardedToday >= DAILY_AWARD_CAP) {
    notifyCapReached(userId);
    return;
  }
  const amount = config.points.studySessionCompleted;
  // No ref: there is no Room model (refId must be an ObjectId).
  const newBalance = await awardPoints(userId, amount, "study_session_completed");
  emitToUser(userId, "aura:awarded", {
    amount,
    newBalance,
    reason: "study_session_completed",
  });
}

/**
 * Aura award pass on NATURAL focus completion. Eligible = unique userIds that
 * were present when the focus phase started AND are still in the room.
 * Each user is isolated in try/catch — a DB failure for one user (or all)
 * must never kill the timer chain.
 *
 * deps:
 *   emitToUser(userId, event, payload) — emit to that user's socket(s) in the room
 *   notifyCapReached(userId)           — targeted "daily cap" system message
 */
async function runAwardPass(room, deps) {
  const stillPresent = new Set(
    Array.from(room.participants.values(), (p) => String(p.userId))
  );

  for (const userId of room.presentAtFocusStart) {
    const uid = String(userId);
    if (!stillPresent.has(uid)) continue;
    const tail = inFlightByUser.get(uid) || Promise.resolve();
    const run = tail.then(() => awardOne(uid, deps)).catch((err) => {
      console.error(`[studyRoom] aura award failed for user ${uid}:`, err.message);
    });
    inFlightByUser.set(uid, run);
    await run;
    if (inFlightByUser.get(uid) === run) inFlightByUser.delete(uid);
  }
}

module.exports = { runAwardPass, startOfLocalDay };
