const express = require("express");
const { register, verify, getUsers } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.get("/verify/:token", verify);
router.get("/users/all", getUsers);

module.exports = router;
