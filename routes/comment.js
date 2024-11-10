const express = require("express");

const { Notification } = require("../model/notification.js");
const { modelMap } = require("../utils/mapping.js");
const { getTokenAndPayload } = require("../utils/getTokenAndPayload.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const router = express.Router({ mergeParams: true });

// 댓글 POST

router.route("/").post(
  asyncHandler(async (req, res) => {
    const { mainCategory, post_id } = req.params;
    const { accessToken, payload } = getTokenAndPayload(req);

    console.log(req);

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

    if (post.writer !== payload.writer) {
      await Notification.findOneAndUpdate(
        { user: post.writer },
        {
          $push: {
            list: {
              triggeredBy: payload._id,
              type: "댓글",
              target_id: newComment._id,
              targetTitle: post.title,
              targetUrl: req.body.targetUrl,
            },
          },
        }
      );
    }

    return res.status(201).send(newComment);
  })
);

// 댓글 PATCH, DELETE

router
  .route("/:comment_id")
  .patch(
    asyncHandler(async (req, res) => {
      const { mainCategory, post_id, comment_id } = req.params;
      const { accessToken, payload } = getTokenAndPayload(req);

      if (!accessToken || !payload) {
        return res.status(401).send({ message: "Unauthorized." });
      }

      const post = await modelMap[mainCategory].findById(post_id);

      if (!post) {
        return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
      }

      const comment = post.commentList.id(comment_id);

      if (!comment) {
        return res.status(404).send({ message: "댓글을 찾을 수 없습니다." });
      }

      if (!accessToken || comment.writer.toString() !== payload._id) {
        return res.status(401).send({ message: "Unauthorized." });
      }

      comment.content = req.body.content;

      await post.save();
      res.send(comment);
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
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
      res.sendStatus(204);
    })
  );

// 답글 POST

router.route("/:comment_id/reply").post(
  asyncHandler(async (req, res) => {
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

    const newReply = {
      ...req.body,
      writer: payload._id,
    };

    comment.reply.push(newReply);
    await post.save();

    let recipients = [post.writer];

    comment.reply.forEach(reply => {
      if (!recipients.includes(reply.writer)) {
        recipients.push(reply.writer);
      };
    });

    if (newReply.writer === post.writer) {
      recipients = recipients.filter(user => user !== post.writer);
    };

    recipients.forEach((recipient) => {
      if (recipient !== newReply.writer) {
        Notification.findOneAndUpdate(
          { user: recipient },
          {
            $push: {
              list: {
                target_id: newReply._id,
                triggeredBy: newReply.writer,
                type: "답글",
                targetTitle: post.title,
                tagetUrl: req.body.targetUrl
              }
            }
          }
        )
      };
    });

    res.status(201).send(newReply);
  })
);

// 답글 PATCH, DELETE

router
  .route("/:comment_id/reply/:reply_id")
  .patch(
    asyncHandler(async (req, res) => {
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
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
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

      await comment.reply.pull(reply_id);

      if (comment.reply.length === 0 && comment.deletedHavingReply) {
        comment.deleteOne();
      };

      await post.save();
      res.sendStatus(204);
    })
  );

module.exports = router;
