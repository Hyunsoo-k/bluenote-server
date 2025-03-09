const mongoose = require("mongoose");

const RecentViewedPostSchema = new mongoose.Schema(
  {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    recentViewedPost: {
      type: [],
      default: [],
      validate: {
        validator: function (value) {
          return value.length <= 10;
        },
        message: "recentViewedPost can contain at most 10 items.",
      }
    }
  }
);

const RecentViewedPost = mongoose.model("RecentViewedPost", RecentViewedPostSchema);

module.exports = { RecentViewedPost };