const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ConnectDatabase = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

const app = express();

// middlewares
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

// call the function here to connect the database
ConnectDatabase();

// Routes
app.use("/api/auth", authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`server started at port ${process.env.PORT}`);
});
