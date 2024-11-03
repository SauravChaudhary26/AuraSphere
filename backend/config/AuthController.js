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

module.exports = {
    registerUser,
    authenticateUser
}
