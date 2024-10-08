const mongoose = require("mongoose");
require("dotenv").config();

async function ConnectDatabase() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("database connected");
  } catch (error) {
    console.log(error);
  }
}
module.exports = ConnectDatabase;

