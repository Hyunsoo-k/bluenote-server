const express = require("express");

const getPhotoNews = require("../middleWare/photoNews/getPhotoNews");

const router = express.Router();

// 포토 뉴스 목록 GET

router.get("/", getPhotoNews);

module.exports = router;