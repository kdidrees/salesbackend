const { registerAdmin } = require("../services/adminService");
const {
  verifyAdminUser,
  loginAdminUser,
  resendVerificationToken,
  requestPasswordReset,
  resetPassword,
  loginService,
  authService
  
} = require("../services/adminService");

exports.AdminRegister = async (req, res) => {
  const { name, email, password } = req.body;
  const protocol = req.protocol;
  const host = req.get("host");

  try {
    const result = await registerAdmin(name, email, password, protocol);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ status: "failed", message: error.message });
  }
};

exports.verifyAdminUser = async (req, res) => {
  const { token } = req.params;

  try {
    const result = await verifyAdminUser(token);

    res.status(200).json({
      status: "success",
      message: result.message,
      password: result.password,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { token, user } = await loginAdminUser(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000,
      sameSite: "Strict",
    });

    res.status(200).json({
      status: "success",
      message: "Login successfull",
      token,
      user,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};



exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await requestPasswordReset(email);
    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const result = await resetPassword(email, otp, password);
    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.resendVerificationToken = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await resendVerificationToken(email);

    if (result.status === "failed") {
      return res.status(400).json({
        status: "failed",
        message: result.message,
      });
    }

    return res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Server error. Please try again later.",
    });
  }
};


// Controller to initiate Google OAuth login
exports.googleLogin = async (req, res) => {
  try {
      const authUrl = await loginService.generateAuthUrl();
      res.redirect(authUrl); // Redirect the user to Google OAuth consent screen
  } catch (error) {
      res.status(500).json({ message: 'Error generating Google login URL', error: error.message });
  }
};
// Controller to handle the Google OAuth login callback
exports.googleLoginCallback = async (req, res) => {
  const { code } = req.query; // Extract code from query params
  try {
      const { token, user } = await loginService.handleGoogleLogin(code);
      res.status(200).json({ token, user });
  } catch (error) {
      if (error.message === 'User not found. Please sign up first.') {
          return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error during Google login', error: error.message });
  }
};


exports.googleAuth = async (req, res) => {
  try {
    const authUrl = await authService.generateAuthUrl();
    res.redirect(authUrl); // Redirect the user to Google OAuth consent screen
  } catch (error) {
    res.status(500).json({ message: 'Error generating Google auth URL', error: error.message });
  }
};
// Controller to handle the Google OAuth callback
exports.googleAuthCallback = async (req, res) => {
  const { code } = req.query; // Extract code from query params
  try {
    const { token, user } = await authService.handleGoogleCallback(code);
    res.status(200).json({ token, user });
  } catch (error) {
    if (error.message === 'User already exists. Please log in.') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error during Google authentication', error: error.message });
  }
};