const express = require("express");

const { getModel } = require("../variable/mapping.js");
const { getTokenAndPayload } = require("../variable/certification.js");
const { asyncHandler } = require("../variable/asyncHandler.js");

const router = express.Router({ mergeParams: true });

// 댓글 POST

router.route("/").post(
  asyncHandler(async (req, res) => {
    const { mainCategory, post_id } = req.params;
    const { token, payload } = getTokenAndPayload(req);
    const post = await getModel(mainCategory).findById(post_id);

    if (!post) {
      return res.status(404).send({ message: "Cannot find post." });
    }

    if (!token) {
      return res.status(401).send({ message: "Unauthorized." });
    }

    const newComment = {
      ...req.body,
      writer: payload._id
    };

    post.comment.push(newComment);
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
        return res.status(404).send({ message: "Cannot find post." });
      }

      const comment = post.comment.id(comment_id);

      if (!comment) {
        return res.status(404).send({ message: "Cannot find comment." });
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
      const { token, payload, isAdmin } = getTokenAndPayload(req);
      const post = await getModel(mainCategory).findById(post_id);
      const comment = post.comment.id(comment_id);

      if (!post) {
        return res.status(404).send({ message: "Cannot find post." });
      }

      if (!comment) {
        return res.status(404).send({ message: "Cannot find comment." });
      }

      if (isAdmin) {
        post.comment.pull(comment_id);
        await post.save();
        return res.sendStatus(204);
      }

      if (!token || comment.writer.toString() !== payload._id) {
        return res.status(401).send({ message: "Unauthorized." });
      }

      post.comment.pull(comment_id);
      await post.save();
      return res.sendStatus(204);
    })
  );

module.exports = router;