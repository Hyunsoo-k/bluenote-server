const { asyncHandler } = require("../utils/asyncHandler.js");
const { modelMap } = require("../utils/mapping.js");

const increaseView = asyncHandler(async (req, res) => {
  const { mainCategory, post_id } = req.params;
  const post = await modelMap[mainCategory].findById(post_id);

  if (!post) {
    return res.status.send({ message: "게시글을 찾을 수 없습니다." });
  };

  post.views += 1;
  await post.save();

  res.send(post);
});

module.exports = increaseView;