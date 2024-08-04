const mongoose = require("mongoose");

const { CommentSchema } = require("./comment.js");

const NoticePostSchema = new mongoose.Schema(
  {
    subCategory: {
      type: String,
      enum: ["notification"],
      trim: true,
    },
    writer: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 40,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    recommend: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 5000,
      trim: true,
    },
    comment: [CommentSchema]
  },
  {
    timestamps: true,
  }
);

const NewsPostSchema = new mongoose.Schema(
  {
    subCategory: {
      type: String,
      enum: ["국내", "국외"],
      trim: true,
    },
    writer: {
      type: String
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    recommend: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 5000,
      trim: true,
    },
    comment: [CommentSchema]
  },
  {
    timestamps: true,
  }
);

const BoardPostSchema = new mongoose.Schema(
  {
    subCategory: {
      type: String,
      enum: ["일반", "녹음", "팁"],
      trim: true,
    },
    writer: {
      type: String
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    recommend: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 5000,
      trim: true,
    },
    comment: [CommentSchema]
  },
  {
    timestamps: true,
  }
);

const PromotePostSchema = new mongoose.Schema(
  {
    subCategory: {
      type: String,
      enum: ["밴드홍보", "앨범홍보", "재즈바홍보"],
      trim: true,
    },
    writer: {
      type: String
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    recommend: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 5000,
      trim: true,
    },
    comment: [CommentSchema]
  },
  {
    timestamps: true,
  }
);

const JobPostSchema = new mongoose.Schema(
  {
    subCategory: {
      type: String,
      enum: ["구인", "구직"],
      trim: true,
    },
    writer: {
      type: String
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    recommend: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 5000,
      trim: true,
    },
    comment: [CommentSchema]
  },
  {
    timestamps: true,
  }
);

const NoticePost = mongoose.model("NoticePost", NoticePostSchema);
const NewsPost = mongoose.model("NewsPost", NewsPostSchema);
const BoardPost = mongoose.model("BoardPost", BoardPostSchema);
const PromotePost = mongoose.model("PromotePost", PromotePostSchema);
const JobPost = mongoose.model("JobPost", JobPostSchema);

module.exports = {
  NoticePost,
  NewsPost,
  BoardPost,
  PromotePost,
  JobPost,
};
