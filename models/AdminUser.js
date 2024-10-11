const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminUser = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    // required: true,
  },
  verificationTokenExpires: {
    type: Date,
    required: true,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    deafult: "role",
  },
  onboarding: {
    type: String,
    enum: ["verify", "about", "company", "finish"],
    default:'verify'
  },
});

// hash password before saving
AdminUser.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(err);
  }
});

module.exports = mongoose.model("adminUser", AdminUser);
