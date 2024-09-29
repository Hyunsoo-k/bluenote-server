const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../model/bbs.js");

dotenv.config();
mongoose.connect(process.env.DATABASE_URL).then(() => console.log("Connected to DB to edit"));

async function renameCommentField() {
  try {
    await NoticePost.updateMany({}, { recommend: [] });
    await NewsPost.updateMany({}, { recommend: [] });
    await BoardPost.updateMany({}, { recommend: [] });
    await PromotePost.updateMany({}, { recommend: [] });
    await JobPost.updateMany({}, { recommend: [] });

    console.log("Successfully add part, profileImageUrl Fields.");
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
}

renameCommentField();
