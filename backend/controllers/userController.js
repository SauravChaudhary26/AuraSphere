const User = require("../models/User");

/**
 * Search users (for adding friends / sending challenges). Returns only public
 * fields — never password hashes, email, or reset tokens — and excludes the
 * requester themselves.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { _id: { $ne: req.userId } };
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    const users = await User.find(query)
      .select("name avatar aura")
      .sort({ name: 1 })
      .limit(20)
      .lean();

    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers };
