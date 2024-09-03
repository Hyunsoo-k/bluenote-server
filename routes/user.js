const express = require("express");

const { User } = require("../model/user.js");
const { getTokenAndPayload } = require("../utils/getTokenAndPayload.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const router = express.Router();

router.route("/").get(
  asyncHandler(async (req, res) => {
    const { payload } = getTokenAndPayload(req);
    const user = await User.findById(payload._id).lean();

    return res.send({
      _id: user._id,
      email: user.email,
      nickname: user.nickname,
      createdAt: user.createdAt,
      role: user.role,
    });
  })
);

module.exports = router;
