const { asyncHandler } = require("../../utils/asyncHandler.js");
const { modelMap } = require("../../variable/modelMap.js");
const { subCategoryEnglishToKoreanMap } = require("../../variable/subCategoryMap.js");
const optimizeBbsList = require("../../utils/optimizeBbsList.js");

const getPostList = asyncHandler(async (req, res) => {
  const { mainCategory } = req.params;
  const { subCategory = "All", page = 1, select, query } = req.query;
  const mainCategoryModel = modelMap[mainCategory];
  const postLimit = mainCategory === "news" || mainCategory === "promote" ? 12 : 15;

  let filter = subCategory === "All" ? {} : { subCategory: subCategoryEnglishToKoreanMap[subCategory] };

  if (query) {
    if (select === "writer") {
      const userList = await modelMap["user"].find({ nickname: { $regex: query, $options: "i" } }).select("_id");
      const user_idList = userList.map((user) => user._id);

      filter = {
        ...filter,
        writer: { $in: user_idList },
      };
    } else if (select === "titleAndContent") {
      filter = {
        ...filter,
        $or: [{ title: { $regex: query, $options: "i" } }, { content: { $regex: query, $options: "i" } }],
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
    }
  }

  const [postList, totalPostCount] = await Promise.all([
    mainCategoryModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * postLimit)
      .limit(postLimit)
      .populate({ path: "writer", select: "_id nickname" })
      .populate({ path: "commentList.writer", select: "_id nickname" })
      .lean(),
    mainCategoryModel.countDocuments(filter),
  ]);

  const responsePostList = await Promise.all(postList.map(optimizeBbsList));

  return res.send({
    mainCategory,
    subCategory: subCategoryEnglishToKoreanMap[subCategory],
    postList: responsePostList,
    totalPostCount,
    page: parseInt(page),
    totalPage: Math.ceil(totalPostCount / postLimit),
  });
});

module.exports = getPostList;
