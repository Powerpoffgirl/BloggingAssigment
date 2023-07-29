const UserSchema = require("../Schemas/UserSchema");
const bcryptjs = require("bcryptjs");
const ObjectId = require("mongodb").ObjectId;

let User = class {
  username;
  name;
  email;
  password;

  constructor({ username, email, password, name }) {
    this.username = username;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  static verifyUserId({ userId }) {
    return new Promise(async (resolve, reject) => {
      console.log("Here", ObjectId.isValid(userId));
      if (!ObjectId.isValid(userId)) {
        reject("Invalid userId format");
      }
      try {
        const userDb = await UserSchema.findOne({ _id: userId });
        if (!userDb) {
          reject(`No user corresponding to this ${userId}`);
        }
        resolve(userDb);
      } catch (error) {
        reject(error);
      }
    });
  }

  registerUser() {
    return new Promise(async (resolve, reject) => {
      const hashedPassword = await bcryptjs.hash(
        this.password,
        parseInt(process.env.SALT)
      );

      const user = new UserSchema({
        username: this.username,
        name: this.name,
        email: this.email,
        password: hashedPassword,
      });

      try {
        const userDb = await user.save();
        resolve(userDb);
      } catch (error) {
        reject(error);
      }
    });
  }

  static verifyUsernameAndEmailExits({ email, username }) {
    return new Promise(async (resolve, reject) => {
      try {
        const userDb = await UserSchema.findOne({
          $or: [{ email }, { username }],
        });
        console.log("userDb", userDb)
        if (userDb && userDb.email === email) {
          reject("Email Already Exit");
        }

        if (userDb && userDb.username === username) {
          reject("Username Already Exit");
        }
        else
        return resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  static loginUser({ email, password }) {

    return new Promise(async (resolve, reject) => {
      try {
        // Find the user with loginId
        const userDb = await UserSchema.findOne({
           email: email
        });
  
        if (!userDb) {
          return reject("User does not exist");
        }
  
        // Match the password
        const isMatch = await bcryptjs.compare(password, userDb.password);
  
        if (!isMatch) {
          return reject("Incorrect password");
        }
  
        resolve(userDb);
      } catch (error) {
        reject(error);
      }
    });
  }
  

};

module.exports = User;

// server --> Controller --> Model -->Schema --> Mongoose
