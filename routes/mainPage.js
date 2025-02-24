const express = require("express");

const { modelMap, subCategoryMap } = require("../utils/mapping.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const optimizePostList = require("../utils/optimizePostList.js");

const router = express.Router();

router.get("/", asyncHandler(async (req, res) => {
  const postLimit = {
    news: 12,
    bandPromotion: 8,
    albumPromotion: 5,
    jazzbarPromotion: 12,
    board: 8,
    job: 8,
  };

  const getOptimizedPostList = (mainCategory, subCategory, limit) => {
    return modelMap[mainCategory]
      .find(subCategory ? { subCategory: subCategoryMap[subCategory] } : {} )
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("createdAt writer title content commentList")
      .lean()
      .then(postList => Promise.all(postList.map(optimizePostList)));
  };
  
  const [
    optimizedNewsList,
    optimizedBandList,
    optimizedAlbumList,
    optimizedJazzbarList,
    optimizedBoardList,
    optimizedJobList
  ] = await Promise.all([
    getOptimizedPostList("news", undefined, postLimit.news),
    getOptimizedPostList("promote", "bandPromotion", postLimit.bandPromotion),
    getOptimizedPostList("promote", "albumPromotion", postLimit.albumPromotion),
    getOptimizedPostList("promote", "jazzbarPromotion", postLimit.jazzbarPromotion),
    getOptimizedPostList("board", undefined, postLimit.board),
    getOptimizedPostList("job", undefined, postLimit.job)
  ]);

  res.send({
    mainPageNewsList: optimizedNewsList,
    mainPageBandList: optimizedBandList,
    mainPageAlbumList: optimizedAlbumList,
    mainPageJazzbarList: optimizedJazzbarList,
    mainPageBoardList: optimizedBoardList,
    mainPageJobList: optimizedJobList,
  });
}));

module.exports = router;
