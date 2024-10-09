const express = require("express");
const {
  register,
  verify,
  getUsers,
  deleteUser,
  login,
  forgotPassword,
  resetPassword,
  verifyToken,
  invitedUsers,
  
} = require("../controllers/authController");
const { AdminRegister ,verifyAdminUser,loginAdmin, ResendverifyAdmin} = require("../controllers/adminAuth");
const VerifyUser = require("../middlewares/auth");

const router = express.Router();

router.post("/register", register);

router.get("/verify/:token", verify);
router.get("/users/all", getUsers);

router.delete("/users/:id", deleteUser);

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-token", verifyToken);

router.get("/invites",VerifyUser, invitedUsers);

router.post("/admin-register", AdminRegister);

router.get("/admin-verify/:token", verifyAdminUser);

router.post("/resend-admin-verify", ResendverifyAdmin);
router.post("/admin-login", loginAdmin);

module.exports = router;