const { signup, login, googleAuth } = require("../controllers/AuthControllers");
const { updateUserProfile } = require("../controllers/UpdateProfileController");
const {
   signupValidation,
   loginValidation,
   updateProfileValidation,
} = require("../middlewares/AuthValidation");
const JwtValidation = require("../middlewares/JwtValidation");
// console.log('Starting authRouter...'); // To check if the file is loading correctly
// const authMiddleware = require("../middlewares/Auth");
// console.log('authMiddleware imported successfully'); // To verify if import worked

const router = require("express").Router();

router.post("/login", loginValidation, login);
router.post("/signup", signupValidation, signup);
router.put(
   "/profile",
   JwtValidation,
   updateProfileValidation,
   updateUserProfile
);
router.get("/google", googleAuth);

// const authMiddleware = require("../middleware/Auth");

module.exports = router;
