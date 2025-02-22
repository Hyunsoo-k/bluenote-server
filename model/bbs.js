const mongoose = require("mongoose");

const CommentSchema = require("./comment");

const NoticePostSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true
    },
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    mainCategory: {
      type: String,
      required: true,
      default: "notice"
    },
    subCategory: {
      required: true,
      type: String,
      enum: ["공지"],
    },
    title: {
      required: true,
      type: String,
      minLength: 2,
      maxLength: 40,
      trim: true,
    },
    views: {
      type: Number, 
      default: 0,
    },
    recommend: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }],
    content: {
      required: true,
      type: String,
      minLength: 1,
      maxLength: 1000000,
      trim: true,
    },
    commentList: [CommentSchema],
  },
  {
    timestamps: true,
  }
);

const NewsPostSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true
    },
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    mainCategory: {
      type: String,
      required: true,
      default: "news"
    },
    subCategory: {
      required: true,
      type: String,
      trim: true,
      enum: ["국내", "국외"],
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
    recommend: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }],
    content: {
      required: true,
      type: String,
      minLength: 1,
      maxLength: 1000000,
      trim: true,
    },
    commentList: [CommentSchema],
  },
  {
    timestamps: true,
  }
);

const BoardPostSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true
    },
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    mainCategory: {
      type: String,
      required: true,
      default: "board"
    },
    subCategory: {
      required: true,
      type: String,
      trim: true,
      enum: ["일반", "녹음", "팁"],
    },
    title: {
      required: true,
      type: String,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    recommend: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }],
    content: {
      required: true,
      type: String,
      minLength: 1,
      maxLength: 1000000,
      trim: true,
    },
    commentList: [CommentSchema],
  },
  {
    timestamps: true,
  }
);

const PromotePostSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true
    },
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    mainCategory: {
      type: String,
      required: true,
      default: "promote"
    },
    subCategory: {
      required: true,
      type: String,
      trim: true,
      enum: ["밴드홍보", "앨범홍보", "재즈바홍보"],
    },
    title: {
      required: true,
      type: String,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    recommend: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }],
    content: {
      required: true,
      type: String,
      minLength: 1,
      maxLength: 1000000,
      trim: true,
    },
    commentList: [CommentSchema],
  },
  {
    timestamps: true,
  }
);

const JobPostSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true
    },
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    mainCategory: {
      type: String,
      required: true,
      default: "job"
    },
    subCategory: {
      required: true,
      type: String,
      trim: true,
      enum: ["구인", "구직"],
    },
    title: {
      required: true,
      type: String,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    recommend: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }],
    content: {
      required: true,
      type: String,
      minLength: 1,
      maxLength: 1000000,
      trim: true,
    },
    commentList: [CommentSchema],
  },
  {
    timestamps: true,
  }
);

NoticePostSchema.index({ createdAt: -1 });
NoticePostSchema.index({ title: "text", content: "text" });

NewsPostSchema.index({ createdAt: -1 });
NewsPostSchema.index({ title: "text", content: "text" });

BoardPostSchema.index({ createdAt: -1 });
BoardPostSchema.index({ title: "text", content: "text" });

PromotePostSchema.index({ createdAt: -1 });
PromotePostSchema.index({ title: "text", content: "text" });

JobPostSchema.index({ createdAt: -1 });
JobPostSchema.index({ title: "text", content: "text" });

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
  JobPost
};
