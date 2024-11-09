const UserModel = require("../models/User");

// Function to update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId; // This should come from the authMiddleware
        // const { userId } = req.body; //Just for testing purposes. Should be corrected after properly implementing JWT.
        const { name, email, password } = req.body;

        // Find the user by ID
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user fields if provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (password && !(await bcrypt.compare(password, user.password))) {
            // Only hash if the password is different
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
    updateUserProfile,
};
