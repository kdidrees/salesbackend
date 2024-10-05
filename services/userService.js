const User = require("../models/User");
const crypto = require("crypto");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const { default: mongoose } = require("mongoose");
const mailgun = new Mailgun(formData);
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Correctly initialize the Mailgun client
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_KEY,
});

const sendVerificationEmail = async (email, link) => {
  const data = {
    from: "BizPro CRM <no-reply@sandbox155b42cee2ba4899b23a05964a1f4269.mailgun.org>",
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

const registerUser = async (users, protocol, host) => {
  const results = [];

  for (const { email, username } of users) {
    try {
      // check if the email or username already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        results.push({
          email,
          status: "error",
          message: "Email already exists",
        });
        continue;
      }

      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) {
        results.push({
          username,
          status: "error",
          message: "Username already exists",
        });
        continue;
      }

      // Generate a random password
      const randomPassword = crypto.randomBytes(6).toString("hex");

      // hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Generate a verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // create new user
      const newUser = new User({
        email,
        username,
        password: hashedPassword,
        verificationToken,
        isVerified: false,
        tempPassword: randomPassword,
      });

      await newUser.save();
      // create verification email
      const verificationLink = `https://wq1jbb9k-4000.inc1.devtunnels.ms/api/verify/${verificationToken}`;

      // Send verification email
      await sendVerificationEmail(email, verificationLink);

      results.push({
        email,
        status: "success",
        message: "User registered, please verify your email",
      });
    } catch (error) {
      results.push({ email, status: "error", message: error.message });
    }
  }

  return results;
};

const verifyUser = async (token) => {
  // Find the user by verification token
  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    throw new Error("Invalid or expired token");
  }

  if (user.isVerified) {
    return { message: "user is already verified" };
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: { isVerified: true },
      $unset: { verificationToken: "", tempPassword: "" },
    }
  );

  return {
    message: "Email verified successfully",
    password: `Here is your password ${user.tempPassword}`,
  };
};

const getUsers = async () => {
  const users = await User.find({ isVerified: true }).select("-password");

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
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.isVerified) {
    throw new Error("Please verify your email to proceed.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // generate jwt token
  const token = jwt.sign(
    { userId: user._id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return {
    status: "success",
    message: "Login successfull",
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
    },
  };
};

module.exports = { registerUser, verifyUser, getUsers, deleteUser,loginUser };
