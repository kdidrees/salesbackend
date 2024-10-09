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
const { AdminRegister ,verifyAdminUser,loginAdmin} = require("../controllers/adminAuth");

const router = express.Router();

router.post("/register", register);
router.get("/verify/:token", verify);
router.get("/users/all", getUsers);
router.delete("/users/:id", deleteUser);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-token", verifyToken);
router.get("/invites", invitedUsers);
router.post("/admin-register", AdminRegister);
router.get("/admin-verify/:token", verifyAdminUser);
router.post("/admin-login", loginAdmin);


module.exports = router;
