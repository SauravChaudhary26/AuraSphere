const { verifyToken } = require("../utils/token");

/**
 * Authentication guard. Verifies the Bearer token and attaches identity to the
 * request. Populates both req.userId (string) and req.user ({ id, email, role }).
 */
const JwtValidation = (req, res, next) => {
  const authHeader = req.header("Authorization") || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded._id;
    req.user = { id: decoded._id, email: decoded.email, role: decoded.role || "user" };
    next();
  } catch (error) {
    const expired = error.name === "TokenExpiredError";
    return res.status(401).json({
      success: false,
      message: expired ? "Session expired, please log in again" : "Invalid token",
      code: expired ? "TOKEN_EXPIRED" : "TOKEN_INVALID",
    });
  }
};

module.exports = JwtValidation;
