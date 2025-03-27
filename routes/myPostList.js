const express = require("express");

const { getMyPostList } = require("../middleWare/myPostList/getMyPostList.js");

const router = express.Router();

// 내가 쓴 게시글 목록 GET

router.get("/", getMyPostList);

module.exports = router;
