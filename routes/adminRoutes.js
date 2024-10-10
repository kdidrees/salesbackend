const express = require("express");
const {
  AdminRegister,
  verifyAdminUser,
  loginAdmin,
  ResendverifyAdmin,
  resetPassword,
  requestPasswordReset,
  resendVerificationToken
} = require("../controllers/adminAuth");

const router = express.Router();

router.post("/register", AdminRegister);
router.get("/verify/:token", verifyAdminUser);
router.post("/verify", ResendverifyAdmin);
router.post("/login", loginAdmin);
router.post("/reset-password",resetPassword); 
router.post("/forgot-password",requestPasswordReset);
router.post('/resend-verification', resendVerificationToken);
module.exports = router;
