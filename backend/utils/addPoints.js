// Backwards-compatible shim. New code should use services/pointsService.
const { awardPoints } = require("../services/pointsService");

/** Award `points` aura to a user for `reason`. Resolves the new balance. */
const setAura = (userId, points, reason = "manual") =>
  awardPoints(userId, points, reason).then((award) => award.balance);

module.exports = setAura;
