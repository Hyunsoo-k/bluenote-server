const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      required: true,
      type: String,
      trim: true,
      unique: true,
    },
    nickname: {
      required: true,
      type: String,
      trim: true,
      minLength: 2,
      maxLength: 7,
      unique: true,
    },
    password: {
      required: true,
      type: String,
      trim: true,
      minLength: 7,
    },
    profileImage: {
      url: { type: String, default: null },
      fileName: { type: String, default: null },
    },
    part: {
      type: String,
      enum: [
        "-",
        "Vocalist",
        "Pianist",
        "Bassist",
        "Guitarist",
        "Drummer",
        "Saxophonist",
        "Trumpeter",
        "Trombonist",
        "Clarinetist",
        "Owner",
        "Listener",
      ],
      default: "-",
    },
    role: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = { User };
