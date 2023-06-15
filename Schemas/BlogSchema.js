const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogsSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  textBody: {
    type: String,
    require: true,
  },
  creationDateTime: {
    type: String,
    require: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    require: true,
  },
  isDeleted: {
    type: Boolean,
    require: true,
    default: false,
  },
  deletionDateTime: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("blogs", blogsSchema);
