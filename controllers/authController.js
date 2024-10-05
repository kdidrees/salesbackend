const {
  registerUser,
  verifyUser,
  getUsers,
  deleteUser,
  loginUser,
} = require("../services/userService");

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

  console.log(email,password,'cred..')

  try {
    const result = await loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
