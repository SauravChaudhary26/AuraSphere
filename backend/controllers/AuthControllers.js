const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409).json({
                message: "User is already exist, you can login",
                success: false,
            });
        }
        const userModel = new UserModel({ name, email, password });
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();
        res.status(201).json({
            message: "Signed up successfully",
            success: true,
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server errror",
            success: false,
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res
                .status(403)
                .json({ message: "Invalid Email or Password", success: false });
        }

        const isPassEqual = await bcrypt.compare(password, user.password);

        if (!isPassEqual) {
            return res
                .status(403)
                .json({ message: "Wrong Password", success: false });
        }

        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "240h" }
        );

        res.status(200).json({
            message: "Logged in Successfully",
            success: true,
            jwtToken,
            name: user.name,
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server error",
            success: false,
        });
    }
};

module.exports = {
    signup,
    login,
};
