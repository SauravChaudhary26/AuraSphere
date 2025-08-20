const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");
const axios = require("axios");
const { oauth2Client } = require("../utils/googleClient");

const signup = async (req, res) => {
   try {
      const { name, email, password } = req.body;
      const user = await UserModel.findOne({ email });
      if (user) {
         return res.status(409).json({
            message: "Useralready exists, you can login",
            success: false,
         });
      }
      const userModel = new UserModel({ name, email, password });
      userModel.password = await bcrypt.hash(password, 10);
      userModel.joined = Date.now();

      const savedUserData = await userModel.save();

      const jwtToken = jwt.sign(
         { email: savedUserData.email, _id: savedUserData._id },
         process.env.JWT_SECRET,
         { expiresIn: "240h" }
      );

      res.status(201).json({
         message: "Signed up successfully",
         success: true,
         jwtToken,
         userId: savedUserData._id,
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

      console.log(user._id);

      res.status(200).json({
         message: "Logged in Successfully",
         success: true,
         jwtToken,
         name: user.name,
         userId: user._id,
      });
   } catch (err) {
      res.status(500).json({
         message: "Internal Server error",
         success: false,
      });
   }
};

/* GET Google Authentication API. */
const googleAuth = async (req, res, next) => {
   console.log("google Auth was called");
   const code = req.query.code;

   console.log("code: ", code);

   try {
      const googleRes = await oauth2Client.getToken(code);
      console.log("oath2client was executed successfully");
      oauth2Client.setCredentials(googleRes.tokens);

      const userRes = await axios.get(
         `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
      );
      const { email, name, picture } = userRes.data;
    //   console.log(userRes);
      let user = await UserModel.findOne({ email });

      if (!user) {
         return res.status(404).json({
            message: "User not found",
         });
      }

      const jwtToken = jwt.sign(
         { email: user.email, _id: user._id },
         process.env.JWT_SECRET,
         { expiresIn: "240h" }
      );

      res.status(200).json({
         email: user.email,
         success: true,
         jwtToken,
         name: user.name,
      });
   } catch (err) {
      console.log(err);

      res.status(500).json({
         message: "Internal Server Error --saurav",
         err,
      });
   }
};

module.exports = {
   signup,
   login,
   googleAuth,
};
