const cheerio = require("cheerio");

const { asyncHandler } = require("../../utils/asyncHandler.js");
const { RecommendedNews } = require("../../model/recommendedNews.js");

const getRecommendedNews = asyncHandler(async (req, res) => {
  const recommendedNews = await RecommendedNews
  .findOne({})
  .populate("recommendedNewsList")
  .lean();

  const response = recommendedNews.recommendedNewsList.map((news) => {
      const $ = cheerio.load(news.content || "");
      const firstImage = $("img").first();
      const thumbnailSrc = firstImage.length ? firstImage.attr("src") : null;

      return ({
        title: news.title,
        thumbnailSrc: thumbnailSrc,
        postUrl: `/bbs/news/post/${news._id}`
      })
  });

  return res.send(response);
});

module.exports = getRecommendedNews