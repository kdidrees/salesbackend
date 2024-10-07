const express = require("express");
const {
  register,
  verify,
  getUsers,
  deleteUser,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.get("/verify/:token", verify);
router.get("/users/all", getUsers);
router.delete("/users/:id", deleteUser);
router.post("/login", login);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password",resetPassword);

module.exports = router;
