const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../model/bbs.js");
const { seedNotice, seedNews, seedBoard, seedPromote, seedJob } = require("./mock.js");

dotenv.config();
mongoose.connect(process.env.DATABASE_URL).then(() => console.log("seed data"));

NoticePost.deleteMany({});
NewsPost.deleteMany({});
BoardPost.deleteMany({});
PromotePost.deleteMany({});
JobPost.deleteMany({});

NoticePost.insertMany(seedNotice);
NewsPost.insertMany(seedNews);
BoardPost.insertMany(seedBoard);
PromotePost.insertMany(seedPromote);
JobPost.insertMany(seedJob);