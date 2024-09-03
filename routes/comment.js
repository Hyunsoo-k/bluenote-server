const express = require("express");

const { getModel } = require("../utils/mapping.js");
const { getTokenAndPayload } = require("../utils/getTokenAndPayload.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const router = express.Router({ mergeParams: true });

// 댓글 POST

router.route("/").post(
  asyncHandler(async (req, res) => {
    const { mainCategory, post_id } = req.params;
    const { token, payload } = getTokenAndPayload(req);
    const post = await getModel(mainCategory).findById(post_id);

    if (!post) {
      return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
    }

    if (!token) {
      return res.status(401).send({ message: "Unauthorized." });
    }

    const newComment = {
      ...req.body,
      writer: payload._id,
    };

    post.commentList.push(newComment);
    await post.save();
    return res.status(201).send(newComment);
  })
);

// 댓글 PATCH, DELETE

router
  .route("/:comment_id")
  .patch(
    asyncHandler(async (req, res) => {
      const { mainCategory, post_id, comment_id } = req.params;
      const { token, payload } = getTokenAndPayload(req);
      const post = await getModel(mainCategory).findById(post_id);

      if (!post) {
        return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
      }

      const comment = post.commentList.id(comment_id);

      if (!comment) {
        return res.status(404).send({ message: "댓글을 찾을 수 없습니다." });
      }

      if (!token || comment.writer.toString() !== payload._id) {
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
      const { token, payload } = getTokenAndPayload(req);
      const post = await getModel(mainCategory).findById(post_id);

      if (!post) {
        return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
      }

      const comment = post.commentList.id(comment_id);

      if (!comment) {
        return res.status(404).send({ message: "댓글을 찾을 수 없습니다." });
      }

      if (payload.role) {
        post.commentList.pull(comment_id);
        await post.save();
        return res.sendStatus(204);
      }

      if (!token || comment.writer.toString() !== payload._id) {
        return res.status(401).send({ message: "Unauthorized." });
      }

      post.commentList.pull(comment_id);
      await post.save();
      return res.sendStatus(204);
    })
  );

module.exports = router;
