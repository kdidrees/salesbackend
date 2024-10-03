const express = require("express");
const { register, verify } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.get("/verify/:token", verify);

module.exports = router;
