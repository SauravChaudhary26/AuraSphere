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
        console.log(user);
        if (!user) {
            return res
                .status(403)
                .json({ message: "Invalid Email or Password", success: false });
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (isPassEqual) console.log("correct password");
        if (!isPassEqual) {
            return res
                .status(403)
                .json({ message: "Wrong Password", success: false });
        }

        // const jwtToken = jwt.sign(
        //     { email: user.email, _id: user._id },
        //     process.env.JWT_SECRET,
        //     { expiresIn: "24h" }
        // );

        res.status(200).json({
            message: "Logged in Successfully",
            success: true,
            // jwtToken,
            // email,
            // name: user.name,
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server error",
            success: false,
        });
    }
};
// const User = require("../models/User");

// Function to update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user; // This should come from the authMiddleware
        const { name, email, password } = req.body;

        // Find the user by ID
        const user = await UserModel.findById(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user fields if provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (password && !(await bcrypt.compare(password, user.password))) { // Only hash if the password is different
            user.password = await bcrypt.hash(password, 10);
        }

        // Save updated user
        const updatedUser = await user.save();

        res.status(200).json({
            message: "User profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
            },
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
    signup,
    login,
    updateUserProfile,
};
