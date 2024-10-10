const AdminUser = require("../models/AdminUser");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendMail");
const { generateVerificationToken } = require("../utils/tokenUtils");
const sendMail = require("../utils/sendMail");

const registerAdmin = async (name, email, password, protocol, host) => {
  try {
    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      throw new Error("Email is already in use.");
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationTokenExpires = Date.now() + 3600000; // 1 hour

    const newAdminUser = new AdminUser({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpires,
    });

    await newAdminUser.save();

    const verificationLink = `https://wq1jbb9k-4000.inc1.devtunnels.ms/api/auth/admin-verify/${verificationToken}`;

    await sendEmail(
      email,
      "Email Verification",
      `Please verify your email address by clicking on the following link: ${verificationLink}`
    );

    return {
      status: "success",
      message:
        "Admin user registered successfully. Please check your email to verify your account.",
      user: {
        _id: newAdminUser._id,
        email: newAdminUser.email,
        name: newAdminUser.name,
        isVerified: newAdminUser.isVerified,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const verifyAdminUser = async (token) => {
  const adminUser = await AdminUser.findOne({ verificationToken: token });

  if (!adminUser) {
    throw new Error("Invalid or expired token");
  }

  if (adminUser.isVerified) {
    return { message: "user is already verified" };
  }

  await AdminUser.updateOne(
    { _id: adminUser._id },
    {
      $set: { isVerified: true },
      $unset: { verificationToken: "" },
    }
  );

  return {
    status: "success",
    message: "Email  verified successfully",
  };
};

const loginAdminUser = async (email, password) => {
  const adminUser = await AdminUser.findOne({ email });

  if (!adminUser) {
    throw new Error("admin user not found");
  }

  const isPasswordMatch = await bcrypt.compare(password, adminUser.password);
  if (!isPasswordMatch) {
    throw new Error("Invalid credentials");
  }

  if (!adminUser.isVerified) {
    throw new Error("Please verify your email first");
  }

  const token = jwt.sign(
    {
      id: adminUser._id,
      email: adminUser.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    token,
    user: {
      id: adminUser._id,
      email: adminUser.email,
      name: adminUser.name,
    },
  };
};


const requestPasswordReset = async (email) => {
  const user = await AdminUser.findOne({ email });

  if (!user) {
    throw new Error("User not found.");
  }

  // generate a random OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = otp;
  user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;

  await user.save();

  const message = `Your OTP for password reset is ${otp}. It is valid for 5 minutes.`;
  await sendMail(user.email, "Password Reset OTP", message);

  return { message: "OTP sent to your email" };
};

const resetPassword = async (email, otp, newPassword) => {
  const user = await AdminUser.findOne({
    email,
    resetPasswordToken: otp,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired OTP.");
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: "password has been reset successfully" };
};

const resendVerificationToken = async (email) => {
  const user = await AdminUser.findOne({ email });
  if (!user) {
    return { status: "failed", message: "User not found" };
  }

  const currentTime = Date.now();
  if (user.isVerified) {
    return {
      status: "failed",
      message: "User is already verified.",
    };
  }

  if (user.verificationTokenExpires > currentTime) {
    return {
      status: "failed",
      message: "Verification email already sent. Please check your email.",
    };
  }

  const { token, expires } = generateVerificationToken();
  user.verificationToken = token;
  user.verificationTokenExpires = expires;

  await user.save();

  const verificationLink = `https://wq1jbb9k-4000.inc1.devtunnels.ms/api/auth/verify/${token}`;
  const subject = "New Verification";
  const message = `Please click the link below to verify your account:\n\n${verificationLink}\n\nThis link is valid for 1 hour.`;

  try {
    await sendMail(user.email, subject, message);
  } catch (error) {
    return { status: "failed", message: "Failed to send verification email" };
  }

  return {
    status: "success",
    message: "Verification email sent successfully!",
  };
};

module.exports = {
  registerAdmin,
  verifyAdminUser,
  loginAdminUser,
  resendVerificationToken,
  requestPasswordReset,
  resetPassword,
};
