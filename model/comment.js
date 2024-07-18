const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    writer: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 30,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 1000,
    }
  },
  {
    timestamps: true
  }
);

exports.CommentSchema = CommentSchema;