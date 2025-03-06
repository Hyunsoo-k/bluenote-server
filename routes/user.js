const express = require("express");

const getUser = require("../middleWare/user/getUser.js");
const patchUser = require("../middleWare/user/patchUser.js");
const getNotification = require("../middleWare/user/getNotification.js");
const checkNotification = require("../middleWare/user/checkNotification.js");
const deleteNotification = require("../middleWare/user/deleteNotification.js");
const getRecentSearch = require("../middleWare/user/getRecentSearch.js");
const createRecentSearch = require("../middleWare/user/createRecentSearch.js");
const deleteRecentSearch = require("../middleWare/user/deleteRecentSearch.js");
const deleteAllRecentSearch = require("../middleWare/user/deleteAllRecentSearch.js");

const router = express.Router();

// 유저 정보 GET

router.route("/")
  .get(getUser)
  .patch(patchUser);

// 유저 알림 GET

router.get("/notification", getNotification);

// 유저 알림 POST(check), DELETE

router.route("/notification/:notification_id")
  .post(checkNotification)
  .delete(deleteNotification);

// 유저 최근 검색어 GET, POST(Create), PATCH(특정 검색기록 삭제), Delete(검색기록 전체 삭제)

router.route("/recentSearch")
  .get(getRecentSearch)
  .post(createRecentSearch)
  .patch(deleteRecentSearch)
  .delete(deleteAllRecentSearch);

module.exports = router;
