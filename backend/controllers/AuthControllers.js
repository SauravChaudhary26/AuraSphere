const bcrypt = require("bcrypt");
const crypto = require("crypto");
const axios = require("axios");

const User = require("../models/User");
const { signToken } = require("../utils/token");
const { getOAuthClient } = require("../utils/googleClient");
const { config } = require("../config");
const { sendEmail } = require("../services/email");
const { passwordReset } = require("../services/emailTemplates");

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  aura: u.aura || 0,
  avatar: u.avatar || null,
  role: u.role || "user",
  equipped: u.equipped || { badge: null, frame: null, nameEffect: null },
});

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });

    const jwtToken = signToken(user);
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      jwtToken,
      userId: user._id,
      name: user.name,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Password is select:false on the schema — request it explicitly here.
    const user = await User.findOne({ email }).select("+password");

    // Generic message for both cases prevents account enumeration.
    const invalid = () =>
      res.status(401).json({ success: false, message: "Invalid email or password" });

    if (!user || !user.password) return invalid();
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return invalid();

    const jwtToken = signToken(user);
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      jwtToken,
      userId: user._id,
      name: user.name,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// Google OAuth — creates an account on first login (previously 404'd).
const googleAuth = async (req, res, next) => {
  try {
    const oauth2Client = getOAuthClient();
    if (!oauth2Client) {
      return res
        .status(501)
        .json({ success: false, message: "Google login is not configured" });
    }

    const { code } = req.query;
    if (!code) return res.status(400).json({ success: false, message: "Missing OAuth code" });

    const { tokens } = await oauth2Client.getToken(code);
    const { data: profile } = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );

    const email = profile.email?.toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: "Google account has no email" });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: profile.name || email.split("@")[0],
        email,
        googleId: profile.id,
        avatar: profile.picture || null,
      });
    } else if (!user.googleId) {
      user.googleId = profile.id;
      if (!user.avatar) user.avatar = profile.picture || null;
      await user.save();
    }

    const jwtToken = signToken(user);
    res.status(200).json({
      success: true,
      jwtToken,
      userId: user._id,
      name: user.name,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// Always responds success to avoid revealing whether an email is registered.
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    const generic = {
      success: true,
      message: "If an account exists for that email, a reset link has been sent.",
    };

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
      user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      const resetUrl = `${config.clientUrl}/reset-password?id=${user._id}&token=${token}`;
      await sendEmail({
        to: user.email,
        subject: "Reset your AuraSphere password",
        html: passwordReset(user.name, resetUrl),
      });
    }
    res.json(generic);
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { id, token, password } = req.body;
    const user = await User.findById(id).select("+resetTokenHash +resetTokenExpires");

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (
      !user ||
      !user.resetTokenHash ||
      user.resetTokenHash !== tokenHash ||
      !user.resetTokenExpires ||
      user.resetTokenExpires.getTime() < Date.now()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "This reset link is invalid or has expired" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetTokenHash = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ success: true, message: "Password updated. You can now log in." });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, me, googleAuth, forgotPassword, resetPassword };
