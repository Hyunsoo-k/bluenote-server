const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../model/bbs.js");
const { User } = require("../model/user.js");

dotenv.config();
mongoose.connect(process.env.DATABASE_URL).then(() => console.log("Connected to DB to edit"));

async function renameCommentField() {
  try {
    await User.updateMany({}, { profileImageUrl: "", part: "-" });

    console.log("Successfully add part, profileImageUrl Fields.");
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
}

renameCommentField();
