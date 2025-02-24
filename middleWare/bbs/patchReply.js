const { modelMap } = require("../utils/mapping.js");
const { getTokenAndPayload } = require("../utils/getTokenAndPayload.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const patchReply = asyncHandler(async (req, res) => {
  const { mainCategory, post_id, comment_id, reply_id } = req.params;
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

  const replyComment = comment.reply.id(reply_id);

  if (!replyComment) {
    return res.status(404).send({ message: "대댓글을 찾을 수 없습니다." });
  };

  if (!accessToken || replyComment.writer.toString() !== payload._id) {
    return res.status(401).send({ message: "Unauthorized." });
  };

  replyComment.content = req.body.content;
  await post.save();

  res.send(replyComment);
});

module.exports = patchReply;