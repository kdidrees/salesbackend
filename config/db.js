const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");

async function ConnectDatabase() {
  await mongoose.connect(process.env.DB_URI);
  console.log("database connected");
}
module.exports = ConnectDatabase;
