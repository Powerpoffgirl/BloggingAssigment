const BlogSchema = require("../Schemas/BlogSchema");
const { BLOGLIMIT } = require("../privateConstants");
const ObjectId = require("mongodb").ObjectId;

const Blogs = class {
  title;
  textBody;
  userId;
  creationDateTime;
  blogId;

  constructor({ title, textBody, userId, creationDateTime, blogId }) {
    this.title = title;
    this.creationDateTime = creationDateTime;
    this.textBody = textBody;
    this.userId = userId;
    this.blogId = blogId;
  }

  createBlog() {
    return new Promise(async (resolve, reject) => {
      this.title.trim();
      this.textBody.trim();
      const blog = new BlogSchema({
        title: this.title,
        textBody: this.textBody,
        userId: this.userId,
        creationDateTime: this.creationDateTime,
      });
      console.log(blog);
      try {
        const blogDb = await blog.save();
        resolve(blogDb);
      } catch (error) {
        reject(error);
      }
    });
  }

  static getBlogs({ followingUserIds, skip }) {
    return new Promise(async (resolve, reject) => {
      // sort, Pagination
      try {
        const blogsDb = await BlogSchema.aggregate([
          {
            $match: {
              userId: { $in: followingUserIds },
              isDeleted: { $ne: true },
            },
          },
          { $sort: { creationDateTime: -1 } },
          {
            $facet: {
              data: [{ $skip: parseInt(skip) }, { $limit: BLOGLIMIT }],
            },
          },
        ]);

        console.log(blogsDb);
        resolve(blogsDb[0].data);
      } catch (error) {
        reject(error);
      }
    });
  }

  static myBlogs({ skip, userId }) {
    return new Promise(async (resolve, reject) => {
      // match, sort, pagination
      console.log(skip, userId);
      try {
        const myBlogsDb = await BlogSchema.aggregate([
          {
            $match: { userId: new ObjectId(userId), isDeleted: { $ne: true } },
          },
          { $sort: { creationDateTime: -1 } },
          {
            $facet: {
              data: [{ $skip: parseInt(skip) }, { $limit: BLOGLIMIT }],
            },
          },
        ]);
        console.log(myBlogsDb[0].data);
        resolve(myBlogsDb[0].data);
      } catch (error) {
        reject(error);
      }
    });
  }

  getBlogDataFromId() {
    return new Promise(async (resolve, reject) => {
      console.log("here", this.blogId);
      try {
        const blogDb = await BlogSchema.findOne({
          _id: this.blogId,
        });

        if (!blogDb) {
          reject("Blog not found");
        }
        resolve(blogDb);
      } catch (error) {
        reject(error);
      }
    });
  }

  updateBlog() {
    return new Promise(async (resolve, reject) => {
      let newBlogData = {};
      try {
        if (this.title) {
          newBlogData.title = this.title;
        }
        if (this.textBody) {
          newBlogData.textBody = this.textBody;
        }

        const oldData = await BlogSchema.findOneAndUpdate(
          { _id: this.blogId },
          newBlogData
        );
        resolve(oldData);
      } catch (error) {
        reject(error);
      }
    });
  }

  deleteBlog() {
    return new Promise(async (resolve, reject) => {
      try {
        // const oldBlogDb = await BlogSchema.findOneAndDelete({
        //   _id: this.blogId,
        // });
        // resolve(oldBlogDb);

        const oldBlogDb = await BlogSchema.findOneAndUpdate(
          { _id: this.blogId },
          { isDeleted: true, deletionDateTime: new Date() }
        );
        resolve(oldBlogDb);
      } catch (error) {
        reject(error);
      }
    });
  }
};

module.exports = Blogs;
