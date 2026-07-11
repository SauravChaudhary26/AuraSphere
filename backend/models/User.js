const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Not required: OAuth-only accounts (Google/GitHub/Facebook) have no password.
    // select:false so password hashes are never returned unless explicitly requested.
    password: { type: String, select: false },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    avatar: { type: String, default: null },

    aura: { type: Number, default: 0, min: 0, index: true },

    // OAuth provider linkage
    googleId: { type: String, default: null },
    githubId: { type: String, default: null },
    facebookId: { type: String, default: null },

    // Notification preferences
    notifyByEmail: { type: Boolean, default: true },

    // Password reset (hashed token; select:false)
    resetTokenHash: { type: String, select: false, default: null },
    resetTokenExpires: { type: Date, select: false, default: null },

    // Retained for backwards-compatibility with existing documents.
    joined: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Preserve the existing production collection name ("userdatas") while
// registering the model as "User" so every `ref: "User"` resolves correctly.
const UserModel = mongoose.model("User", UserSchema, "userdatas");
module.exports = UserModel;
