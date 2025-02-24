const express = require("express");
const getPostList = require("../middleWare/bbs/getPostList.js");
const getPost = require("../middleWare/bbs/getPost.js");
const patchPost = require("../middleWare/bbs/patchPost.js");
const deletePost = require("../middleWare/bbs/deletePost.js");
const createPost = require("../middleWare/bbs/createPost.js");
const increaseView = require("../middleWare/bbs/increaseView.js");
const recommendPost = require("../middleWare/bbs/recommnedPost.js");

const commentRoutes = require("./comment.js");

const router = express.Router();

// 게시글 목록 GET

router.get("/:mainCategory", getPostList);

// 게시글 GET, PATCH, DELETE

router.route("/:mainCategory/post/:post_id")
  .get(getPost)
  .patch(patchPost)
  .delete(deletePost);

// 게시글 Post(Create)

router.post("/:mainCategory/post", createPost);

// 게시글 조회수 Post

router.post("/:mainCategory/post/:post_id/views", increaseView);

// 게시글 추천

router.post("/:mainCategory/post/:post_id/recommend", recommendPost)

// 댓글 라우터

router.use("/:mainCategory/post/:post_id/comment", commentRoutes);

module.exports = router;