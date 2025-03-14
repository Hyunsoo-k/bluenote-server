const { asyncHandler } = require("../../utils/asyncHandler.js");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");
const { modelMap } = require("../../variable/modelMap.js");

const deleteComment = asyncHandler(async (req, res) => {
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

  if (comment.writer.toString() !== payload._id) {
    return res.status(401).send({ message: "Unauthorized." });
  };

  if (comment.reply.length > 0) {
    comment.deletedHavingReply = true;
    await post.save();

    return res.sendStatus(204);
  };

  post.commentList.pull(comment_id);
  await post.save();

  res.sendStatus(204).end();
});

module.exports = deleteComment;