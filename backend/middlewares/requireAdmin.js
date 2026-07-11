const User = require("../models/User");

/**
 * Authorisation guard for admin-only endpoints. Must run after JwtValidation.
 * Re-reads the role from the database so a revoked admin cannot keep access
 * until their token expires.
 */
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requireAdmin;
