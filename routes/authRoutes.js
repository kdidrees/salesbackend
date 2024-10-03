const express = require("express");
const {
  register,
  verify,
  getUsers,
  deleteUser,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.get("/verify/:token", verify);
router.get("/users/all", getUsers);
router.get("/users/:id", deleteUser);

module.exports = router;
