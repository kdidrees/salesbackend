const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const ConnectDatabase = require("./config/db");

const app = express();

// middlewares
app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// call the function here to connect the database

ConnectDatabase();

app.listen(process.env.PORT, () => {
  console.log(`server started at port ${process.env.PORT}`);
});
