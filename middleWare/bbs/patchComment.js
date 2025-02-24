const { asyncHandler } = require("../../utils/asyncHandler.js");
const { modelMap } = require("../../utils/mapping.js");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");

const patchComment = asyncHandler(async (req, res) => {
  const { mainCategory, post_id, comment_id } = req.params;
  const { accessToken, payload } = getTokenAndPayload(req);

  if (!accessToken || !payload) {
    return res.status(401).send({ message: "Unauthorized." });
  };

  const post = await modelMap[mainCategory].findById(post_id);

  if (!post) {
    return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
  };

  const comment = post.commentList.id(comment_id);

  if (!comment) {
    return res.status(404).send({ message: "댓글을 찾을 수 없습니다." });
  };

  if (!accessToken || comment.writer.toString() !== payload._id) {
    return res.status(401).send({ message: "Unauthorized." });
  };

  comment.content = req.body.content;

  await post.save();

  res.send(comment);
});

module.exports = patchComment;