const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../model/bbs.js");

dotenv.config();
mongoose.connect(process.env.DATABASE_URL).then(() => console.log("Connected to DB to edit"));

async function updateCommentList() {
  try {
    await NoticePost.updateMany({}, { $set: { commentList: [] } });
    await NewsPost.updateMany({}, { $set: { commentList: [] } });
    await BoardPost.updateMany({}, { $set: { commentList: [] } });
    await PromotePost.updateMany({}, { $set: { commentList: [] } });
    await JobPost.updateMany({}, { $set: { commentList: [] } });

    console.log("Successfully updated commentList field.");
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
}

updateCommentList();
