const User = require("../models/User");
const crypto = require("crypto");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const { default: mongoose } = require("mongoose");
const mailgun = new Mailgun(formData);

// Correctly initialize the Mailgun client
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_KEY,
});

const sendVerificationEmail = async (email, link) => {
  const data = {
    from: "BissPro CRM <no-reply@sandbox155b42cee2ba4899b23a05964a1f4269.mailgun.org>",
    to: email,
    subject: "Email Verification",
    html: `<p>Please verify your email by clicking on the following link:</p>
           <a href="${link}">${link}</a>`,
  };

  try {
    return await mg.messages.create(process.env.MAILGUN_DOMAIN, data);
  } catch (error) {
    console.error("Mailgun error:", error);
  }
};

const registerUser = async (email, protocol, host) => {
  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Generate a verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Create new user
  const newUser = new User({
    email,
    verificationToken,
    isVerified: false,
  });

  await newUser.save();

  // Create a verification link
  const verificationLink = `https://wq1jbb9k-4000.inc1.devtunnels.ms/api/verify/${verificationToken}`;

  // Send verification email using Mailgun
  await sendVerificationEmail(email, verificationLink);
  return { message: "User registered, please verify your email" };
};

const verifyUser = async (token) => {
  // Find the user by verification token
  const user = await User.findOne({ verificationToken: token });

  console.log(user, "iuser");
  if (!user) {
    throw new Error("Invalid or expired token");
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: { isVerified: true },
      $unset: { verificationToken: "" },
    }
  );

  return { message: "Email verified successfully" };
};

const getUsers = async () => {
  const users = await User.find({ isVerified: true });

  if (!users) {
    throw new Error("no users");
  }

  return users;
};

const deleteUser = async (userId) => {
  const user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });

  if (!user) {
    throw new Error("user not found");
  }

  await User.deleteOne(user);

  return { status: "success", message: "user deleted successfully", user };
  
};

module.exports = { registerUser, verifyUser, getUsers, deleteUser };
