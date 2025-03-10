const mongoose = require("mongoose");

const RecommendedNewsSchema = new mongoose.Schema({
  recommendedNewsList: {
    required: true,
    type: [mongoose.Schema.Types.ObjectId],
    ref: "NewsPost",
    default: [],
    validata: {
      validate: {
        validator: function (value) {
          return value.length <= 5;
        },
        message: "recommendedNewsList can contain at most 5 items.",
      }
    }
  }
});

const RecommendedNews = mongoose.model("RecommendedNews", RecommendedNewsSchema);

module.exports = { RecommendedNews };