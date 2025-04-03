const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { User } = require("../model/user.js");
const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../model/bbs.js");

dotenv.config();

mongoose.connect(process.env.DATABASE_URL).then(() => console.log("Connected to DB to seed"));

const practiceOperator = async () => {
  const newsPosts = await NewsPost.aggregate([
    { $match: {} },
    { $sort: { _id: 1 }},
    { $lookup : {
        from: "newsposts",
        localField: "postList.post_id",
        foreignField: "_id",
        as: "newsPosts"
      }
    }
  ]);

  console.log(newsPosts);
};

practiceOperator();