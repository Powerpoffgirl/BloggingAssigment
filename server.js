const express = require("express");
const clc = require("cli-color");
require("dotenv").config();
const server = express();
const PORT = process.env.PORT;
server.get("/", (req, res) => {
  return res.send({
    status: 200,
    message: "Welcome to your blogging app",
  });
});

server.listen(PORT, (req, res) => {
  console.log(clc.yellow.underline(`Server is running on port ${PORT}`));
});
