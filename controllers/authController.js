const {
  registerUser,
  verifyUser,
  getUsers,
  deleteUser
} = require("../services/userService");

exports.register = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await registerUser(email, req.protocol, req.get("host"));
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verify = async (req, res) => {
  const { token } = req.params;

  console.log(token, "token");
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

    console.log(error,'err.')
  }
};
