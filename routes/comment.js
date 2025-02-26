const express = require("express");

const createComment = require("../middleWare/bbs/createComment.js");
const patchComment = require("../middleWare/bbs/patchComment.js");
const deleteComment = require("../middleWare/bbs/deleteComment.js");
const createReply = require("../middleWare/bbs/createReply.js");
const patchReply = require("../middleWare/bbs/patchReply.js");
const deleteReply = require("../middleWare/bbs/deleteReply.js");

const router = express.Router({ mergeParams: true });

// 댓글 POST(Create)

router.post("/", createComment);

// 댓글 PATCH, DELETE

router.route("/:comment_id").patch(patchComment).delete(deleteComment);

// 답글 POST(Create)

router.post("/:comment_id/reply", createReply);

// 답글 PATCH, DELETE

router.route("/:comment_id/reply/:reply_id").patch(patchReply).delete(deleteReply);

module.exports = router;
