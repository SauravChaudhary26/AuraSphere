const jwt = require("jsonwebtoken");
const { config } = require("../config");

/**
 * Sign a short-lived access token for a user document.
 * Payload keeps `_id` (read by JwtValidation) plus standard claims.
 */
function signToken(user) {
  return jwt.sign(
    { _id: user._id.toString(), email: user.email, role: user.role || "user" },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

module.exports = { signToken, verifyToken };
