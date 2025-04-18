const express = require("express");

const { asyncHandler } = require("../utils/asyncHandler.js");
const { modelMap } = require("../variable/modelMap.js");
const { subCategoryEnglishToKoreanMap } = require("../variable/subCategoryMap.js");
const optimizeBbsList = require("../utils/optimizeBbsList.js");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const postLimit = {
      news: 12,
      bandPromotion: 8,
      albumPromotion: 5,
      jazzbarPromotion: 12,
    };

    const getOptimizedPostList = (mainCategory, subCategory, limit) => {
      return modelMap[mainCategory]
        .find(subCategory ? { subCategory: subCategoryEnglishToKoreanMap[subCategory] } : {})
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("createdAt writer mainCategory subCategory title content commentList")
        .lean()
        .then((postList) => Promise.all(postList.map(optimizeBbsList)));
    };

    const [
      optimizedNewsList,
      optimizedBandList,
      optimizedAlbumList,
      optimizedJazzbarList
    ] = await Promise.all([
      getOptimizedPostList("news", undefined, postLimit.news),
      getOptimizedPostList("promote", "bandPromotion", postLimit.bandPromotion),
      getOptimizedPostList("promote", "albumPromotion", postLimit.albumPromotion),
      getOptimizedPostList("promote", "jazzbarPromotion", postLimit.jazzbarPromotion),
    ]);

    res.send({
      mainPageNewsList: optimizedNewsList,
      mainPageBandList: optimizedBandList,
      mainPageAlbumList: optimizedAlbumList,
      mainPageJazzbarList: optimizedJazzbarList,
    });
  })
);

module.exports = router;
