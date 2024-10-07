const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ConnectDatabase = require("./config/db");
const authRoutes = require("./routes/authRoutes");

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

// Routes
app.use("/api/auth", authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`server started at port ${process.env.PORT}`);
});
