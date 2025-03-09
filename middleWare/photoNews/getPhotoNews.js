const cheerio = require("cheerio");

const { asyncHandler } = require("../../utils/asyncHandler.js");
const { NewsPost } = require("../../model/bbs");

const getPhotoNews = asyncHandler(async (req, res) => {
  const photoNewsItems = await NewsPost
    .find()
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const response = photoNewsItems.map((news) => {
    const $ = cheerio.load(news.content || "");
    const firstImage = $("img").first();
    const thumbnailSrc = firstImage.length ? firstImage.attr("src") : null;

    return {
      title: news.title,
      thumbnailSrc
    };
  });

  res.send(response);
});

module.exports = getPhotoNews;