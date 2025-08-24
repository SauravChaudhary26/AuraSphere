const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    joined:{
        type: Date,
        required: true,
    },
    aura:{
        type: Number,
        default: 0
    }
},
{
    versionKey: false, // Disables the __v field
});

const UserModel = mongoose.model("userdata", UserSchema);
module.exports = UserModel;
