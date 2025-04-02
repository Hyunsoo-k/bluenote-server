const mongoose = require("mongoose");

const { asyncHandler } = require("../../utils/asyncHandler.js");
const { modelMap } = require("../../variable/modelMap.js");
const { subCategoryEnglishToKoreanMap } = require("../../variable/subCategoryMap.js");
const optimizeBbsList = require("../../utils/optimizeBbsList.js");

const getPostList = asyncHandler(async (req, res) => {
  const { mainCategory } = req.params;
  const {
    subCategory = "All",
    cursor = null,
    select,
    query } = req.query;

  const mainCategoryModel = modelMap[mainCategory];
  const limit = mainCategory === "news" || mainCategory === "promote"
    ? 12
    : 15;

  let filter = subCategory === "All"
    ? {}
    : { subCategory: subCategoryEnglishToKoreanMap[subCategory] };

  if (query) {
    if (select === "writer") {
      const userList = await modelMap["user"]
      .find({ nickname: { $regex: query, $options: "i" } })
      .select("_id");

      const user_idList = userList.map((user) => user._id);

      filter = {
        ...filter,
        writer: { $in: user_idList },
      };
    } else if (select === "titleAndContent") {
      filter = {
        ...filter,
        $or: [
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } }
        ],
      };
    } else if (select === "title") {
      filter = {
        ...filter,
        title: { $regex: query, $options: "i" },
      };
    } else if (select === "content") {
      filter = {
        ...filter,
        content: { $regex: query, $options: "i" },
      };
    };
  };

  if (cursor) {
    filter._id = { $lt: new mongoose.Types.ObjectId(String(cursor)) };
  };

  const postList = await mainCategoryModel
    .find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)  // 문서를 하나 더 요청하여 아래에 hasNextPage에서 다음 문서가 있는지 확인
    .populate({ path: "writer", select: "_id nickname" })
    .lean();

  const hasNextPage = postList.length > limit;

  if (hasNextPage) {
    postList.pop();
  };
  
  const responsePostList = await Promise.all(postList.map(optimizeBbsList));

  return res.send({
    postList: responsePostList,
    hasNextPage
  });
});

module.exports = getPostList;
