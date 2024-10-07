const {
  registerUser,
  verifyUser,
  getUsers,
  deleteUser,
  loginUser,
  requestOTPForPasswordReset,
  verifyOTPAndResetPassword,
  verifyToken,
} = require("../services/authService");

exports.register = async (req, res) => {
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res
      .status(400)
      .json({ error: "No emails provided or invalid format" });
  }

  try {
    const results = await registerUser(users, req.protocol, req.get("host"));
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verify = async (req, res) => {
  const { token } = req.params;

  try {
    const result = await verifyUser(token);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const result = await getUsers();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params;

  try {
    const result = await deleteUser(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });

    console.log(error, "err.");
  }
};

// login controller

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// requesting OTP for password reset
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await requestOTPForPasswordReset(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// for verifying OTP and resetting password

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const result = await verifyOTPAndResetPassword(email, otp, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyToken = (req, res) => {
  const { token } = req.body;

  try {
    const decodedUser = verifyToken(token);
    return res.status(200).json({
      valid: true,
      user: decodedUser,
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
};
