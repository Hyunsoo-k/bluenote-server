const { asyncHandler } = require("../../utils/asyncHandler.js");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");
const { Notification } = require("../../model/notification.js");
const { modelMap } = require("../../utils/mapping.js");

const createReply = asyncHandler(async (req, res) => {
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

  const newReply = comment.reply.create({
    ...req.body,
    writer: payload._id,
  });

  comment.reply.push(newReply);
  await post.save();

  let recipients = [post.writer.toString(), ...(post.writer.toString() !== comment.writer.toString() ? [comment.writer.toString()] : [])];

  comment.reply.forEach(reply => {
    if (!recipients.includes(reply.writer.toString())) {
      recipients.push(reply.writer.toString());
    };
  });

  const recipientExceptWriter = recipients.filter(recipient => recipient.toString() !== newReply.writer.toString());

  await Promise.all(
    recipientExceptWriter.map(async recipient => {
      await Notification.findOneAndUpdate(
        { user: recipient },
        {
          $push: {
            list: {
              target_id: newReply._id,
              triggeredBy: newReply.writer,
              type: "답글",
              targetTitle: post.title,
              postUrl: req.body.postUrl
            },
          },
        },
        { upsert: true }
      );
    })
  );

  res.status(201).send(newReply);
});

module.exports = createReply;