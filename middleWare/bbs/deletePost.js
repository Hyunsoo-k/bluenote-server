const { asyncHandler } = require("../../utils/asyncHandler.js");
const { modelMap } = require("../../utils/mapping.js");

const deletePost = asyncHandler(async (req, res) => {
  const { mainCategory, post_id } = req.params;
  const { accessToken, payload } = getTokenAndPayload(req);
  const post = await modelMap[mainCategory].findById(post_id);

  if (!post) {
    return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
  };

  if (payload.role) {
    await modelMap[mainCategory].findByIdAndDelete(post_id);

    return res.sendStatus(204);
  };

  await post.populate("writer");

  if (!accessToken || post.writer._id.toString() !== payload._id) {
    return res.status(401).send({ message: "Unauthorized" });
  };

  await modelMap[mainCategory].findByIdAndDelete(post_id);

  return res.sendStatus(204);
});

module.exports = deletePost;