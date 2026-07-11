const rateLimit = require("express-rate-limit");

const json = (message) => (req, res) =>
  res.status(429).json({ success: false, message });

/** Broad limiter applied to the whole API. */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json("Too many requests, please slow down"),
});

/** Strict limiter for auth endpoints (brute-force / enumeration protection). */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: json("Too many attempts, please try again in a few minutes"),
});

module.exports = { apiLimiter, authLimiter };
