const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../model/bbs.js");

dotenv.config();
mongoose.connect(process.env.DATABASE_URL)
  .then(async () => {
    console.log("Connected to DB to delete");

    await NoticePost.deleteMany({});
    await NewsPost.deleteMany({});
    await BoardPost.deleteMany({});
    await PromotePost.deleteMany({});
    await JobPost.deleteMany({});

    console.log("All documents deleted");
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("Error connecting to DB:", err);
  });