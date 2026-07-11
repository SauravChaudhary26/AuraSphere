const router = require("express").Router();

const {
  signup,
  login,
  me,
  googleAuth,
  forgotPassword,
  resetPassword,
} = require("../controllers/AuthControllers");
const { updateUserProfile } = require("../controllers/UpdateProfileController");
const {
  githubStart,
  githubCallback,
  facebookStart,
  facebookCallback,
} = require("../controllers/oauthController");
const {
  signupValidation,
  loginValidation,
  updateProfileValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../middlewares/AuthValidation");
const JwtValidation = require("../middlewares/JwtValidation");

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.get("/google", googleAuth);
router.get("/github/start", githubStart);
router.get("/github/callback", githubCallback);
router.get("/facebook/start", facebookStart);
router.get("/facebook/callback", facebookCallback);
router.get("/me", JwtValidation, me);
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);
router.post("/reset-password", resetPasswordValidation, resetPassword);
router.put("/profile", JwtValidation, updateProfileValidation, updateUserProfile);

module.exports = router;
