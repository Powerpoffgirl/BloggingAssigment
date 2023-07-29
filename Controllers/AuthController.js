const express = require("express");
const AuthRouter = express.Router();
const { cleanUpAndValidate } = require("../utils/AuthUtils");
const User = require("../Models/UserModel");
const { isAuth } = require("../Middlewares/AuthMiddleware");


//  /auth/register
AuthRouter.post("/register", async (req, res) => {
  console.log(req.body);
  const { name, username, email, password } = req.body;
  
  await cleanUpAndValidate({ name, email, password, username })
    .then(async () => {
      try {
        await User.verifyUsernameAndEmailExits({ email, username });
      } catch (error) {
        return res.send({
          status: 400,
          message: "Error Occurred",
          error: error,
        });
      }

      //create an obj for user class
      const userObj = new User({
        name,
        email,
        password,
        username,
      });

      try {
        const userDb = await userObj.registerUser();
        console.log(userDb);
        return res.send({
          status: 200,
          message: "User Created Successfully",
          data: userDb,
        });
      } catch (error) {
        return res.send({
          status: 500,
          message: "Database error",
          error: error,
        });
      }
    })
    .catch((err) => {
      return res.send({
        status: 400,
        message: "Data Invalid",
        error: err,
      });
    });
});

// Assuming you have properly defined the AuthRouter using Express Router
AuthRouter.post("/login", async (req, res) => {
  try {
    console.log("REQUEST BODY",req.body)
    const { email, password } = req.body;
    // console.log("LOGIN_ID", loginId + "PASSWORD", password)
    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: "Missing Credentials",
      });
    }

    const userDb = await User.loginUser({ email, password });

    if (!userDb) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Match the password
    const isMatch = await bcryptjs.compare(password, userDb.password);

    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        message: "Incorrect password",
      });
    }

    // Session-based authentication
    req.session.isAuth = true;
    req.session.user = {
      username: userDb.username,
      email: userDb.email,
      userId: userDb._id,
    };

    return res.status(200).json({
      status: 200,
      message: "Login Successfully",
      data: userDb,
    });
  } catch (error) {
    console.error("Error occurred during login:", error);
    return res.status(500).json({
      status: 500,
      message: "Error Occurred",
      error: error.message, // Sending only the error message for security
    });
  }
});

AuthRouter.post("/logout", isAuth, (req, res) => {
  const user = req.session.user;

  req.session.destroy((err) => {
    if (err) {
      return res.send({
        status: 400,
        message: "Logout unsuccessfull",
        error: err,
      });
    }

    return res.send({
      status: 200,
      message: "Logout Sucessfully",
      data: user,
    });
  });
});

module.exports = AuthRouter;
