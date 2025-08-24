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
        const points = await Points.findOneAndUpdate(
            { user: req.user.id },
            { $inc: { total: req.body.points } },
            { new: true }
        );
        if (!points) {
            return res.status(404).json({ message: "No points found" });
        }
        return res.status(200).json(points);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};