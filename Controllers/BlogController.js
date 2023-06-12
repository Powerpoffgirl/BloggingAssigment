const express = require("express");
const { BlogDataValidate } = require("../utils/BlogUtils");
const User = require("../Models/UserModel");
const Blogs = require("../Models/BlogModel");
const BlogRouter = express.Router();

BlogRouter.post("/create-blog", async (req, res) => {
  const { title, textBody } = req.body;
  const userId = req.session.user.userId;
  const creationDateTime = new Date();

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

//  /blog/get-blogs
BlogRouter.get("/get-blogs", async (req, res) => {
  const skip = req.query.skip || 0;

  try {
    const blogDb = await Blogs.getBlogs({ skip });
    console.log("I am blogDb", blogDb);
    return res.send({
      status: 200,
      message: "Read success",
      data: blogDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

BlogRouter.get("/my-blogs", async (req, res) => {
  const skip = req.query.skip || 0;
  const userId = req.session.user.userId;

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
});

module.exports = BlogRouter;
