const express = require("express");
const {
  AdminRegister,
  verifyAdminUser,
  loginAdmin,
  resetPassword,
  requestPasswordReset,
  resendVerificationToken
} = require("../controllers/adminAuth");

const router = express.Router();

router.post("/register", AdminRegister);
router.get("/verify/:token", verifyAdminUser);
router.post("/login", loginAdmin);
router.post("/reset-password",resetPassword); 
router.post("/forgot-password",requestPasswordReset);
router.post('/resend-verification', resendVerificationToken);

// // Initiate Google Auth flow
// app.get('/auth/google/signup', SignupController.googleAuth);
// // Handle Google Auth callback
// app.get('/auth/google/signup/callback', SignupController.googleAuthCallback);
// // Route to initiate Google login
// app.get('/auth/google/login', loginController.googleLogin);
// // Route to handle the Google login callback
// app.get('/auth/google/login/callback', loginController.googleLoginCallback);

module.exports = router;
