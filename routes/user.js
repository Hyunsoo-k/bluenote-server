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
      email: user.email,
      nickname: user.nickname,
      createdAt: user.createdAt,
      isAdmin
    })
  })
)

module.exports = router;