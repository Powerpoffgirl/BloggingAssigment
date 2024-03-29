const express = require("express");
const { BlogDataValidate } = require("../utils/BlogUtils");
const User = require("../Models/UserModel");
const Blogs = require("../Models/BlogModel");
const BlogRouter = express.Router();
const { followingUsersList } = require("../Models/FollowModel");
const { isAuth } = require("../Middlewares/AuthMiddleware");
const jwt = require('jsonwebtoken');

BlogRouter.post("/create-blog", async (req, res) => {
  const { title, textBody } = req.body;
  const authorizationHeader = req.header('Authorization');
  if (!authorizationHeader) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized: Token not provided",
    });
  }
   const token = authorizationHeader.split(' ')[1];
    // Verify the token and extract user information
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decodedToken.userId;
   
  const creationDateTime = new Date();
  console.log("TITLE FROM CREATE BLOGS", title, "BODY FROM CREATE BLOGS", textBody)
  // Data validation
  await BlogDataValidate({ title, textBody, userId })
    .then(async () => {
      try {
        await User.verifyUserId({ userId });
      } catch (error) {
        return res.send({
          status: 400,
          message: "userId issue",
          error: err,
        });
      }
      const blogObj = new Blogs({ title, textBody, userId, creationDateTime });
      console.log(blogObj);
      try {
        const blogDb = await blogObj.createBlog();

        return res.send({
          status: 201,
          message: "Blog created Successfully",
          data: blogDb,
        });
      } catch (error) {
        return res.send({
          status: 500,
          message: "Database error ",
          error: error,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.send({
        status: 400,
        message: "Data Error",
        error: err,
      });
    });
});

//  /blog/get-blogs?skip=5
BlogRouter.get("/get-blogs", async (req, res) => {
  const skip = req.query.skip || 0;
  const authorizationHeader = req.header('Authorization');
  if (!authorizationHeader) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized: Token not provided",
    });
  }
   const token = authorizationHeader.split(' ')[1];
    // Verify the token and extract user information
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const followerUserId = decodedToken.userId;
  // const followerUserId = req.session.user.userId;

  try {
    const followingList = await followingUsersList({ followerUserId, skip });
    // console.log(followingList);

    // get the following userIDs
    let followingUserIds = [];
    followingList.forEach((obj) => {
      followingUserIds.push(obj._id);
    });

    const blogDb = await Blogs.getBlogs({ followingUserIds, skip });
    // console.log("I am blogDb", blogDb);
    return res.send({
      status: 200,
      message: "Read success",
      data: blogDb,
    });
  } catch (error) {
    // console.log(error);
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

BlogRouter.get("/my-blogs", async (req, res) => {
  const skip = req.query.skip || 0;
  const authorizationHeader = req.header('Authorization');
  if (!authorizationHeader) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized: Token not provided",
    });
  }

  try {
    // Extract the token from the header
    const token = authorizationHeader.split(' ')[1];
    console.log("TOKEN FROM MY_BLOGS", token)
    // Verify the token and extract user information
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED TOKEN", decodedToken)
    const userId = decodedToken.userId;
    console.log("USER ID MY BLOGS", userId)
    try {
      const myBlogDb = await Blogs.myBlogs({ skip, userId });
      return res.send({
        status: 200,
        message: "Read success",
        data: myBlogDb,
      });
    } catch (error) {
      console.log(error);
      return res.send({
        status: 500,
        message: "Database error",
        error: error,
      });
    }
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized',
      error: 'Invalid token'
    });
  }
});

BlogRouter.post("/edit-blog", async (req, res) => {
  // find: blogId
  // update: title, textBody
  // userId : session

  const { title, textBody } = req.body.data;
  const blogId = req.body.blogId;
  const authorizationHeader = req.header('Authorization');
  if (!authorizationHeader) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized: Token not provided",
    });
  }
   const token = authorizationHeader.split(' ')[1];
    // Verify the token and extract user information
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decodedToken.userId;
  try {
    //find the blog with blogId
    const blogObj = new Blogs({ title, textBody, userId, blogId });
    const blogDb = await blogObj.getBlogDataFromId();

    //compare the owner and the user making the request to edit
    //if(userId1.toString() === userId2.toString())
    if (!blogDb.userId.equals(userId)) {
      return res.send({
        status: 401,
        message: "Not allowed to edit, Authorization Failed",
      });
    }

    //compare the time, within 30 mins
    const creationDateTime = new Date(blogDb.creationDateTime).getTime();
    const currentDateTime = Date.now();

    console.log((currentDateTime - creationDateTime) / (1000 * 60));
    const diff = (currentDateTime - creationDateTime) / (1000 * 60);

    if (diff > 30) {
      return res.send({
        status: 401,
        message: "Not allowed to edit after 30 mins of creation",
      });
    }

    // if < 30, then update the blog

    const oldBlogDb = await blogObj.updateBlog();

    return res.send({
      status: 200,
      message: "Update successfull",
      data: oldBlogDb,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: 400,
      message: "Data Error",
      error: err,
    });
  }
});

BlogRouter.post("/delete-blog", async (req, res) => {
  const blogId = req.body.blogId;
  const authorizationHeader = req.header('Authorization');
  if (!authorizationHeader) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized: Token not provided",
    });
  }
   const token = authorizationHeader.split(' ')[1];
    // Verify the token and extract user information
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decodedToken.userId;

  try {
    // find the blog with blogId
    const blogObj = new Blogs({ userId, blogId });
    const blogDb = await blogObj.getBlogDataFromId();

    if (!blogDb.userId.equals(userId)) {
      return res.send({
        status: 401,
        message: "Not allowed to delete, Authorization Failed",
      });
    }

    const oldBlogDb = await blogObj.deleteBlog();

    return res.send({
      status: 200,
      message: "Delete successfull",
      data: oldBlogDb,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Data Error",
      error: error,
    });
  }
});

module.exports = BlogRouter;
