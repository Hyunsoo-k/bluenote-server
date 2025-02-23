const { Notification } = require("../model/notification.js");
const { modelMap } = require("../utils/mapping.js");
const { getTokenAndPayload } = require("../utils/getTokenAndPayload.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const createComment = asyncHandler(async (req, res) => {
  const { mainCategory, post_id } = req.params;
  const { accessToken, payload } = getTokenAndPayload(req);

  if (!accessToken || !payload) {
    return res.status(401).send({ message: "Unauthorized." });
  };

  const post = await modelMap[mainCategory].findById(post_id);

  if (!post) {
    return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
  };

  const newComment = post.commentList.create({
    content: req.body.content,
    writer: payload._id,
  });

  post.commentList.push(newComment);
  await post.save();

  if (post.writer.toString() !== newComment.writer.toString()) {
    await Notification.findOneAndUpdate(
      { user: post.writer },
      {
        $push: {
          list: {
            target_id: newComment._id,
            triggeredBy: newComment.writer,
            type: "댓글",
            targetTitle: post.title,
            postUrl: req.body.postUrl,  
          },
        },
      }
    );
  }

  return res.status(201).send(newComment);
});

module.exports = createComment;