const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/User");

const registerUser = async (req, res) => {
    try {
        const { name, email, Reg } = req.body;
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists, please log in.', success: false });
        }

        const newUser = new UserModel({ name, email, Reg });
        newUser.Reg = await bcrypt.hash(Reg, 10);
        await newUser.save();

        res.status(201).json({
            message: "Registration successful",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

const authenticateUser = async (req, res) => {
    try {
        const { email, Reg } = req.body;
        const user = await UserModel.findOne({ email });
        const errorMessage = 'Authentication failed: incorrect email or Reg';

        if (!user) {
            return res.status(403).json({ message: errorMessage, success: false });
        }

        const RegMatch = await bcrypt.compare(Reg, user.Reg);
        if (! RegMatch) {
            return res.status(403).json({ message: errorMessage, success: false });
        }

        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Login successful",
            success: true,
            jwtToken,
            email,
            name: user.name
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

// const User = require("../models/User");

// Function to update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user; // This should come from the authMiddleware
        const { name, email, password } = req.body;

        // Find the user by ID
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user fields if provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            const bcrypt = require("bcryptjs");
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
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
    registerUser,
    authenticateUser,
    updateUserProfile
}
