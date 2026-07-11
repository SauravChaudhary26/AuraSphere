const bcrypt = require("bcrypt");
const User = require("../models/User");

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  aura: u.aura || 0,
  avatar: u.avatar || null,
  role: u.role || "user",
  notifyByEmail: u.notifyByEmail !== false,
});

const updateUserProfile = async (req, res, next) => {
  try {
    const { name, email, password, currentPassword, avatar, notifyByEmail } = req.body;

    const user = await User.findById(req.userId).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(409).json({ success: false, message: "That email is already in use" });
      }
      user.email = email;
    }
    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar || null;
    if (typeof notifyByEmail === "boolean") user.notifyByEmail = notifyByEmail;

    if (password) {
      // If the account already has a password, require and verify the current one.
      if (user.password) {
        if (!currentPassword) {
          return res
            .status(400)
            .json({ success: false, message: "Current password is required to set a new one" });
        }
        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok) {
          return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }
      }
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { updateUserProfile };
