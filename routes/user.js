const express = require("express");

const getUser = require("../middleWare/user/getUser.js");
const patchUser = require("../middleWare/user/patchUser.js");
const getUserNotification = require("../middleWare/user/getUserNotification.js");
const checkUserNotification = require("../middleWare/user/checkUserNotification.js");
const deleteUserNotification = require("../middleWare/user/deleteUserNotification.js");

const router = express.Router();

// 유저 정보 GET

router.route("/").get(getUser).patch(patchUser);

// 유저 알림 GET

router.get("/notification", getUserNotification);

// 유저 알림 POST(check), DELETE

router.route("/notification/:notification_id").post(checkUserNotification).delete(deleteUserNotification);

module.exports = router;
