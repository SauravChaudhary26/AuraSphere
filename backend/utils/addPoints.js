// utils/addPoints.js
const UserModel = require("../models/User");

const setAura = async (userId, points) => {
    if (typeof points !== "number") {
        throw new Error("Points must be a number");
    }

    const user = await UserModel.findByIdAndUpdate(
        userId,
        { $inc: { aura: points } },
        { new: true }
    );

    if (!user) {
        throw new Error("User not found");
    }

    return user.aura;
};

module.exports = setAura;