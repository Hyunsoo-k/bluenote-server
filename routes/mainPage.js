const express = require("express");
const { modelMap, subCategoryMap } = require("../utils/mapping.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const optimizePostList = require("../utils/optimizePostList.js");

const router = express.Router();

router.route("/").get(
  asyncHandler(async (req, res) => {
    const postLimit = {
      news: 12,
      bandPromotion: 8,
      albumPromotion: 5,
      jazzbarPromotion: 12,
      board: 8,
      job: 8,
    };

    const [
      optimizedNewsList,
      optimizedBandList,
      optimizedAlbumList,
      optimizedJazzbarList,
      optimizedBoardList,
      optimizedJobList
    ] = await Promise.all([
      modelMap["news"]
        .find()
        .sort({ createdAt: -1 })
        .limit(postLimit.news)
        .lean()
        .then(postList => Promise.all(postList.map(optimizePostList))),
      modelMap["promote"]
        .find({ subCategory: subCategoryMap["bandPromotion"] })
        .limit(postLimit.bandPromotion)
        .lean()
        .then(postList => Promise.all(postList.map(optimizePostList))),
      modelMap["promote"]
        .find({ subCategory: subCategoryMap["albumPromotion"] })
        .limit(postLimit.albumPromotion)
        .lean()
        .then(postList => Promise.all(postList.map(optimizePostList))),
      modelMap["promote"]
        .find({ subCategory: subCategoryMap["jazzbarPromotion"] })
        .limit(postLimit.jazzbarPromotion)
        .lean()
        .then(postList => Promise.all(postList.map(optimizePostList))),
      modelMap["board"]
        .find().sort({ createdAt: -1 })
        .limit(postLimit.board)
        .lean()
        .then(postList => Promise.all(postList.map(optimizePostList))),
      modelMap["job"]
        .find()
        .sort({ createdAt: -1 })
        .limit(postLimit.job)
        .lean()
        .then(postList => Promise.all(postList.map(optimizePostList))),
    ]);

    res.send({
      mainPageNewsList: optimizedNewsList,
      mainPageBandList: optimizedBandList,
      mainPageAlbumList: optimizedAlbumList,
      mainPageJazzbarList: optimizedJazzbarList,
      mainPageBoardList: optimizedBoardList,
      mainPageJobList: optimizedJobList,
    });
  })
);

module.exports = router;
