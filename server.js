const express = require("express");
const clc = require("cli-color");
require("dotenv").config();
const AuthRouter = require("./Controllers/AuthController");
// file imports
const db = require("./db");
const server = express();
const PORT = process.env.PORT;

// middlewares
server.use(express.json());

// routes
server.get("/", (req, res) => {
  return res.send({
    status: 200,
    message: "Welcome to your blogging app",
  });
});

server.use("/auth", AuthRouter);

server.listen(PORT, (req, res) => {
  console.log(clc.yellow.underline(`Server is running on port ${PORT}`));
});
