const express = require("express");

const getRecommendedNews = require("../middleWare/recommendedNews/getRecommendedNews.js");
const createRecommendedNews = require("../middleWare/recommendedNews/createRecommendedNews.js");

const router = express.Router();

// 추천 뉴스 GET, POST

router.route("/")
  .get(getRecommendedNews)
  .post(createRecommendedNews);

module.exports = router;