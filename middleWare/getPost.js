const { asyncHandler } = require("../utils/asyncHandler.js");
const { modelMap } = require("../utils/mapping.js");

const getPost = asyncHandler(async (req, res) => {
  const { mainCategory, post_id } = req.params;
  const post = await modelMap[mainCategory]
    .findById(post_id)
    .populate({ path: "writer", select: "_id nickname" })
    .populate({ path: "commentList.writer", select: "_id nickname profileImage" })
    .populate({ path: "commentList.reply.writer", select: "_id nickname profileImage" })
    .lean();

  if (!post) {
    return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
  };

  const previousPost = await modelMap[mainCategory]
    .findOne({ createdAt: { $lt: post.createdAt } })
    .sort({ createdAt: -1 })
    .select("_id title createdAt")
    .lean();

  const nextPost = await modelMap[mainCategory]
    .findOne({ createdAt: { $gt: post.createdAt } })
    .sort({ createdAt: 1 })
    .select("_id title createdAt")
    .lean();

  return res.send({
    ...post,
    previousPost,
    nextPost,
  });
});

module.exports = getPost;