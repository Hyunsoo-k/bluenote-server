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
    const post = await modelMap[mainCategory].findById(post_id);

    if (!post) {
      return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
    }

    if (!accessToken) {
      return res.status(401).send({ message: "Unauthorized." });
    }

    const newComment = {
      content: req.body.content,
      writer: payload._id,
    };

    post.commentList.push(newComment);
    await post.save();

    if (post.writer !== payload.writer) {
      const notification = await Notification.findOne({ user: post.writer });

      notification.list.push({
        triggeredBy: payload._id,
        type: "댓글",
        targetTitle: post.title,
        targetUrl: req.body.targetUrl,
      });

      await notification.save();
    };

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
      const post = await modelMap[mainCategory].findById(post_id);

      if (!post) {
        return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
      };

      const comment = post.commentList.id(comment_id);

      if (!comment) {
        return res.status(404).send({ message: "댓글을 찾을 수 없습니다." });
      };

      if (payload.role) {
        if (comment.reply.length > 0) {
          comment.deletedHavingReply = true;
          await post.save();
          return res.sendStatus(204);
        };

        post.commentList.pull(comment_id);
        await post.save();
        return res.sendStatus(204);
      };

      if (!accessToken || comment.writer.toString() !== payload._id) {
        return res.status(401).send({ message: "Unauthorized." });
      };

      if (comment.reply.length > 0) {
        comment.deletedHavingReply = true;
        await post.save();
        return res.sendStatus(204);
      };

      post.commentList.pull(comment_id);
      await post.save();
      return res.sendStatus(204);
    })
  );

// 대댓글 POST

router.route("/:comment_id/reply").post(
  asyncHandler(async (req, res) => {
    const { mainCategory, post_id, comment_id } = req.params;
    const { accessToken, payload } = getTokenAndPayload(req);
    const post = await modelMap[mainCategory].findById(post_id);

    if (!post) {
      return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
    }

    const comment = post.commentList.id(comment_id);

    if (!comment) {
      return res.status(404).send({ message: "댓글을 찾을 수 없습니다." });
    }

    if (!accessToken) {
      return res.status(401).send({ message: "Unauthorized." });
    }

    const newComment = {
      ...req.body,
      writer: payload._id,
    };

    comment.reply.push(newComment);
    await post.save();
    return res.status(201).send(newComment);
  })
);

// 대댓글 PATCH, DELETE

router
  .route("/:comment_id/reply/:reply_id")
  .patch(
    asyncHandler(async (req, res) => {
      const { mainCategory, post_id, comment_id, reply_id } = req.params;
      const { accessToken, payload } = getTokenAndPayload(req);
      const post = await modelMap[mainCategory].findById(post_id);

      if (!post) {
        return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
      }

      const comment = post.commentList.id(comment_id);

      if (!comment) {
        return res.status(404).send({ message: "댓글을 찾을 수 없습니다." });
      }

      const replyComment = comment.reply.id(reply_id);

      if (!replyComment) {
        return res.status(404).send({ message: "대댓글을 찾을 수 없습니다." });
      }

      if (!accessToken || replyComment.writer.toString() !== payload._id) {
        return res.status(401).send({ message: "Unauthorized." });
      }

      replyComment.content = req.body.content;
      await post.save();
      res.send(replyComment);
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { mainCategory, post_id, comment_id, reply_id } = req.params;
      const { accessToken, payload } = getTokenAndPayload(req);
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
      return res.sendStatus(204);
    })
  );

module.exports = router;
