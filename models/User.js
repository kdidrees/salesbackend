const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  verificationToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  tempPassword: {
    type: String,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
});

module.exports = mongoose.model("User", userSchema);
