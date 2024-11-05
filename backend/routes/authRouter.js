const { signup, login, updateUserProfile } = require("../controllers/AuthControllers");
const {
    signupValidation,
    loginValidation,
    updateProfileValidation,
} = require("../middlewares/AuthValidation");
// console.log('Starting authRouter...'); // To check if the file is loading correctly
const authMiddleware = require("../middlewares/Auth"); 
// console.log('authMiddleware imported successfully'); // To verify if import worked
const router = require("express").Router();

router.post("/login", loginValidation, login);
router.post("/signup", signupValidation, signup);
router.put("/profile", authMiddleware, updateProfileValidation, updateUserProfile);
// const authMiddleware = require("../middleware/Auth");

module.exports = router;
