const mongoose = require("mongoose");

const MyPostSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    postList: [
      {
        refTarget: {
          type: String,
          required: true,
          enum: [
            "NoticePost",
            "NewsPost",
            "BoardPost",
            "PromotePost",
            "JobPost"
          ],
        },
        post_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "postList.refTarget",
        },
      },
    ],
    _id: false
  }
);

const MyPost = mongoose.model("MyPost", MyPostSchema);

module.exports = { MyPost };
