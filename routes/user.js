const express = require("express");

const { User } = require("../model/user.js");
const { Notification } = require("../model/notification.js");
const { getTokenAndPayload } = require("../utils/getTokenAndPayload.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const router = express.Router();

// 유저 정보 GET

router
  .route("/")
  .get(
    asyncHandler(async (req, res) => {
      const { accessToken, payload } = getTokenAndPayload(req);

      if (!accessToken || !payload) {
        return res.status(401).send({ message: "Unauthorized." });
      };

      const user = await User.findById(payload._id).lean();

      return res.send({
        _id: user._id,
        email: user.email,
        nickname: user.nickname,
        profileImage: { url: user.profileImage.url, fileName: user.profileImage.fileName },
        part: user.part,
        createdAt: user.createdAt,
        role: user.role,
      });
    })
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { nickname } = req.body;
      const { payload } = getTokenAndPayload(req);

      if (!payload) {
        return res.statue(401).send({ message: "Unauthorized." });
      };

      const isNicknameExist = await User.findOne({ nickname });

      if (isNicknameExist && isNicknameExist._id.toString() !== payload._id) {
        return res.status(409).send({ message: "이미 존재하는 닉네임 입니다." });
      };

      const editedUser = await User.findByIdAndUpdate(
        payload._id,
        { ...req.body },
        { new: true, runValidators: true }
      ).lean();

      return res.send(editedUser);
    })
  );

// 유저 알림 GET

router.route("/notification").get(
  asyncHandler(async (req, res) => {
    const { accessToken, payload } = getTokenAndPayload(req);

    if (!accessToken || !payload) {
      return res.status(401).send({ message: "Unauthorized." });
    };

    const notification = await Notification
      .findOne({ user: payload._id })
      .populate({ path: "list.triggeredBy", select: "nickname profileImage" })
      .lean();

    let newNotificationCount = 0;

    notification.list.forEach((item) => {
      !item.isChecked && newNotificationCount ++;
    });

    const response = { ...notification, newNotificationCount };

    res.send(response);
  })
);

// 유저 알림 POST(check), DELETE

router
  .route("/notification/:notification_id")
  .post(
    asyncHandler(async (req, res) => {
      const { notification_id } = req.params;
      const { accessToken, payload } = getTokenAndPayload(req);

      if (!accessToken || !payload) {
        return res.status(401).send({ message: "Unauthorized." });
      };

      await Notification.findOneAndUpdate(
        { user: payload._id, "list._id": notification_id },
        { $set: { "list.$.isChecked": true } },
      )
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { notification_id } = req.params;
      const { accessToken, payload } = getTokenAndPayload(req);

      if (!accessToken || !payload) {
        return res.status(401).send({ message: "Unauthorized." });
      };

      await Notification.findOneAndUpdate(
        { user: payload._id },
        { $pull: { list : { _id: notification_id } } }
      );

      return res.status(204).end();
    })
  );

module.exports = router;
