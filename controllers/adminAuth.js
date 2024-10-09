const adminService = require("../services/adminService");
const { registerAdmin } = require("../services/adminService");
const { verifyAdminUser } = require("../services/adminService");

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
