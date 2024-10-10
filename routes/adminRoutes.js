const express = require("express");
const {
  AdminRegister,
  verifyAdminUser,
  loginAdmin,
  resetPassword,
  requestPasswordReset,
  resendVerificationToken,
  googleAuth,
  googleAuthCallback,
  googleLogin,
  googleLoginCallback,
} = require("../controllers/adminAuth");

const router = express.Router();

router.post("/register", AdminRegister);
router.get("/verify/:token", verifyAdminUser);
router.post("/login", loginAdmin);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", requestPasswordReset);
router.post("/resend-verification", resendVerificationToken);

// Initiate Google Auth flow
router.get("/google/signup", googleAuth);
// Handle Google Auth callback
router.get("/google/signup/callback", googleAuthCallback);
// Route to initiate Google login
router.get("/google/login", googleLogin);
// Route to handle the Google login callback
router.get("/google/login/callback", googleLoginCallback);

module.exports = router;
