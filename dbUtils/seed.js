const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { User } = require("../model/user.js");
const { MyPost } = require("../model/myPost.js");
const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../model/bbs.js");

dotenv.config();

mongoose.connect(process.env.DATABASE_URL).then(() => console.log("Connected to DB to seed"));

const seedingMyPost = async () => {
  const mainCategoryToModelStringMap = {
    notice: "NoticePost",
    news: "NewsPost",
    board: "BoardPost",
    promote: "PromotePost",
    job: "JobPost"
  };

  const jobPostList = await JobPost.find().lean();

  jobPostList.filter(async (post) => {
    await MyPost.updateOne(
      { user_id: post.writer },
      {
        $push: {
          postList: {
            refTarget: mainCategoryToModelStringMap[post.mainCategory],
            post_id: post._id,
          },
        }
      }
    )
  });
};

seedingMyPost();