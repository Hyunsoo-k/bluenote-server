const { asyncHandler } = require("../../utils/asyncHandler.js");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");
const { RecommendedNews } = require("../../model/recommendedNews.js");

const createRecommendedNews = asyncHandler(async (req, res) => {
  const { accessToken, payload } = getTokenAndPayload(req);

  if (!accessToken || !payload || payload.role !== 1) {
    return res.status(401).send({ message: "Unauthorized." });
  };

  const recommendedNews = await RecommendedNews.findOne({});

  if (recommendedNews.recommendedNewsList.length < 5) {
    recommendedNews.recommendedNewsList.unshift(req.body.newRecommendedNews_id);

    await recommendedNews.save();

    return res.status(201).send();
  };

  if (recommendedNews.recommendedNewsList.length >= 5) {
    recommendedNews.recommendedNewsList.pop();

    recommendedNews.recommendedNewsList.unshift(req.body.newRecommendedNews_id);

    await recommendedNews.save();

    return res.status(201).send();
  };
});

module.exports = createRecommendedNews;