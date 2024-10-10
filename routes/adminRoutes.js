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

module.exports = router;
