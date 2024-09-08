const express = require("express");

const { User } = require("../model/user.js");
const { getTokenAndPayload } = require("../utils/getTokenAndPayload.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const router = express.Router();

router
  .route("/")
  .get(
    asyncHandler(async (req, res) => {
      const { accessToken, payload } = getTokenAndPayload(req);

      if (!accessToken || !payload) {
        return res.status(401).send({ message: "Unauthorized." });
      }
      console.log(payload);

      const user = await User.findById(payload._id).lean();

      return res.send({
        _id: user._id,
        email: user.email,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
        part: user.part,
        createdAt: user.createdAt,
        role: user.role,
      });
    })
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { nickname, part, profileImageUrl } = req.body;
      const { payload } = getTokenAndPayload(req);

      if (!payload) {
        return res.statue(401).send({ message: "Unauthorized." });
      }

      const isNicknameExist = await User.findOne({ nickname });

      if (isNicknameExist && isNicknameExist.nickname !== nickname) {
        return res.status(409).send({ message: "이미 존재하는 닉네임 입니다." });
      }

      const user = await User.findByIdAndUpdate(
        payload._id,
        { nickname, part, profileImageUrl },
        { new: true, runValidators: true }
      ).lean();

      return res.send({
        _id: user._id,
        email: user.email,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
        part: user.part,
        createdAt: user.createdAt,
        role: user.role,
      });
    })
  );

module.exports = router;
