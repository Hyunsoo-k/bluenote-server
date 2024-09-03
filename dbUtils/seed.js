const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../model/bbs.js");

dotenv.config();
mongoose.connect(process.env.DATABASE_URL).then(() => console.log("Connected to DB to seed"));

NoticePost.deleteMany();
NewsPost.deleteMany();
BoardPost.deleteMany();
PromotePost.deleteMany();
JobPost.deleteMany();

NoticePost.insertMany();
NewsPost.insertMany();
BoardPost.insertMany();
PromotePost.insertMany();
JobPost.insertMany();