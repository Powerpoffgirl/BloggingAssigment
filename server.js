const express = require("express");
const clc = require("cli-color");
require("dotenv").config();
const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);
const AuthRouter = require("./Controllers/AuthController");
// file imports
const db = require("./db");
const BlogRouter = require("./Controllers/BlogController");
const { isAuth } = require("./Middlewares/AuthMiddleware");
const FollowRouter = require("./Controllers/FollowController");
const cleanUpBin = require("./cron");
const server = express();
const cors = require("cors");

const PORT = process.env.PORT || 8000;

// middlewares
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const store = new mongoDbSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

server.use(
  cors({
    origin: "https://64e356d6a80c180d450dbed9--lively-bubblegum-2d7311.netlify.app"||"http://localhost:3000" , // Replace with the actual origin of your React app
    credentials: true,
  })
);

server.use(
  session({
    secret: process.env.SECRECT_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

server.use(AuthRouter);
// routes
server.get("/", (req, res) => {
  return res.send({
    status: 200,
    message: "Welcome to your blogging app",
  });
});

server.use("/auth", AuthRouter);
server.use("/blog", isAuth, BlogRouter);
server.use("/follow", isAuth, FollowRouter);

server.listen(8000, (req, res) => {
  console.log(clc.yellow.underline(`Server is running on port 8000`));
  cleanUpBin();
});
