import UserModel from "../models/User.js";

export const getPoints = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "Invalid user" });
        }

		const points = user.aura;

        return res.status(200).json(points);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const setPoints = async (req, res) => {
    try {
        const user = await UserModel.findByIdAndUpdate(
            req.userId,
            { $inc: { aura: req.body.points } },  // increment aura instead of total
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ points: user.aura });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};