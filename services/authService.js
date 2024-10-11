const User = require("../models/User");
const crypto = require("crypto");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const { default: mongoose } = require("mongoose");
const mailgun = new Mailgun(formData);
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendMail");

// Correctly initialize the Mailgun client
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_KEY,
});

const sendVerificationEmail = async (email, link) => {
  const data = {
    from: "BizPro CRM <no-replsy@sandbox155b42cee2ba4899b23a05964a1f4269.mailgun.org>",
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
  let overallStatus = "success";
  let overallMessage = "All users registered successfully";

  for (const { email, username, role } of users) {
    try {
      // Check if the email or username already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        overallStatus = "error"; // Update overall status
        overallMessage = "Some users could not be registered"; // Update overall message
        continue;
      }

      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) {
        overallStatus = "error";
        overallMessage = "some user could not be registered";
      }

      // Generate a random password
      const randomPassword = crypto.randomBytes(6).toString("hex");

      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Generate a verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Create new user
      const newUser = new User({
        email,
        username,
        password: hashedPassword,
        verificationToken,
        isVerified: false,
        tempPassword: randomPassword,
        role: "user",
      });

      await newUser.save();
      // Create verification email
      const verificationLink = `https://wq1jbb9k-4000.inc1.devtunnels.ms/api/auth/verify/${verificationToken}`;

      // Send verification email
      await sendEmail(
        email,
        "Email Verification",
        `Please verify your email address by clicking on the following link: ${verificationLink}`
      );

      results.push({
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        isVerified: newUser.isVerified,
      });
    } catch (error) {
      overallStatus = "error";
      overallMessage = "Some users could not be registered";
    }
  }

  return {
    status: overallStatus,
    message: overallMessage,
    data: results,
  };
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
  const users = await User.find({ isVerified: true }).select(
    "-password -verificationToken  -tempPassword -otp -otpExpiry"
  );

  if (!users) {
    throw new Error("no users");
  }

  return users;
};

const invitedUsers = async () => {
  const users = await User.find({ isVerified: false }).select(
    "-password -verificationToken  -tempPassword -otp -otpExpiry"
  );

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

const requestOTPForPasswordReset = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("No user found with this email");
  }

  // generate a 6 digit O.T.P
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // set OTP expiry (e.g, 10 minutes)
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  // save otp and expiry in the user document
  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // send the otp with mailgun
  const subject = "Password Reset OTP";
  const message = `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`;
  await sendEmail(user.email, subject, message);

  return { status: "success", message: "OTP sent to your email address" };
};

// verify otp and reset password service
const verifyOTPAndResetPassword = async (email, otp, newPassword) => {
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp) {
    throw new Error("Invalid OTP or email");
  }

  if (user.otpExpiry && user.otpExpiry < new Date()) {
    throw new Error("OTP expired");
  }

  // hash the new password using bcryptjs
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // update user's password and clear otp-related fields
  user.password = hashedPassword;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  return { status: "success", message: "Password reset successfully" };
};

const verifyToken = (token) => {
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    // verify the token with the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

module.exports = {
  registerUser,
  verifyUser,
  getUsers,
  deleteUser,
  loginUser,
  requestOTPForPasswordReset,
  verifyOTPAndResetPassword,
  verifyToken,
  invitedUsers,
};
