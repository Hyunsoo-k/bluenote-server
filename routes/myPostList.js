const express = require("express");

const { asyncHandler } = require("../utils/asyncHandler.js");
const { getTokenAndPayload } = require("../utils/getTokenAndPayload.js");
const { getMyPostList } = require("../utils/getMyPostList.js");

const router = express.Router();

router.route("/").get(
  asyncHandler(async (req, res) => {
    const { page = 1 } = req.query;
    const { payload } = getTokenAndPayload(req);
    const { postList, totalPostCount } = await getMyPostList(payload._id, Number(page));

    res.send({
      postList,
      totalPostCount,
      page: parseInt(page),
      totalPageCount: Math.ceil(totalPostCount / 10),
    });
  })
);

module.exports = router;
