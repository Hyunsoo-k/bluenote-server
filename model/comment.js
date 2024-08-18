const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

exports.CommentSchema = CommentSchema;
