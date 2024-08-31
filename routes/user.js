const express = require("express");

const { User } = require("../model/user.js");
const { getTokenAndPayload } = require("../variable/certification.js");
const { asyncHandler } = require("../variable/erroHandler.js");

const router = express.Router();

router.route("/").get(
  asyncHandler(async(req, res) => {
    const { payload, isAdmin } = getTokenAndPayload(req);
    const user = await User.findById(payload.user_id).lean();

    return res.send({
      user_id: user._id,
      email: user.email,
      nickname: user.nickname,
      createdAt: user.createdAt,
      role: user.role
    })
  })
)

module.exports = router;