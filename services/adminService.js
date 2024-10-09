const AdminUser = require("../models/AdminUser");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendMail");

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

module.exports = { registerAdmin, verifyAdminUser };
