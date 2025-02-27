const mongoose = require("mongoose");

const recentSearchSchema = new mongoose.Schema(
  {
    user: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    queryList: {
      required: true,
      type: [{ type: String, trim: true }],
      default: []
    }
  },
  {
    timestamps: true,
  }
);

const RecentSearch = mongoose.model("RecentSearch", recentSearchSchema);

module.exports = { RecentSearch };