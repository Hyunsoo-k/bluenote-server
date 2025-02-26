const express = require("express");

const getUser = require("../middleWare/user/getUser.js");
const patchUser = require("../middleWare/user/patchUser.js");
const getUserNotification = require("../middleWare/user/getUserNotification.js");
const checkUserNotification = require("../middleWare/user/checkUserNotification.js");
const deleteUserNotification = require("../middleWare/user/deleteUserNotification.js");
const getUserRecentSearch = require("../middleWare/user/getUserRecentSearch.js")
const createUserRecentSearch = require("../middleWare/user/createUserRecentSearch.js");
const patchUserRecentSearch = require("../middleWare/user/patchUserRecentSearch.js");

const router = express.Router();

// 유저 정보 GET

router.route("/")
.get(getUser)
.patch(patchUser);

// 유저 알림 GET

router.get("/notification", getUserNotification);

// 유저 알림 POST(check), DELETE

router.route("/notification/:notification_id")
  .post(checkUserNotification)
  .delete(deleteUserNotification);

// 유저 최근 검색어 GET, POST(Create), PATCH(특정 검색기록 삭제)

router.route("/recentSearch")
  .get(getUserRecentSearch)
  .post(createUserRecentSearch)
  .patch(patchUserRecentSearch)

module.exports = router;
