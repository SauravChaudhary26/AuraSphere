const mongoose = require('mongoose');
const { Schema } = mongoose; // Destructure Schema for cleaner code

// Define the User schema
const UserSchema = new Schema({
    name: {
        type: String,
        required: true, // Name is required
    },
    email: {
        type: String,
        required: true, // Email is required
        unique: true, // Email must be unique
        lowercase: true, // Normalize to lowercase
        trim: true, // Remove surrounding whitespace
    },
    Reg: {
        type: number,
        required: true, 
        length: 8, 
    }
}, { timestamps: true }); // Automatically add createdAt and updatedAt timestamps

// Create the User model
const UserModel = mongoose.model('User', UserSchema); // Use singular name for model

module.exports = UserModel; // Export the User model
