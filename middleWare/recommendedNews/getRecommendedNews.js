const { asyncHandler } = require("../../utils/asyncHandler.js");
const { RecommendedNews } = require("../../model/recommendedNews.js");

const getRecommendedNews = asyncHandler(async (req, res) => {
  const recommendedNewsList = await RecommendedNews
  .find()
  .sort({ createdAt: -1 })
  .lean();

  const response = recommendedNewsList.map((recommendedNews) => ({
    title: recommendedNews.title,
    thumbnailSrc: recommendedNews.thumbnailSrc,
    postUrl: `/bbs/news/post/${recommendedNews._id}`
  }));

  return res.send(response);
});

module.exports = getRecommendedNews