const express = require("express");

const { asyncHandler } = require("../variable/erroHandler.js");
const { getTokenAndPayload } = require("../variable/certification.js");
const { getMyPostList } = require("../variable/getMyPostList.js");

const router = express.Router();

router.route("/").get(
  asyncHandler(async (req, res) => {
    const { page = 1 } = req.query;
    const { payload } = getTokenAndPayload(req);
    const { paginatedPosts: postList, totalPostCount } = await getMyPostList(payload.user_id, Number(page));

    res.send({
      postList,
      totalPostCount,
      page: parseInt(page),
      totalPageCount: Math.ceil(totalPostCount / 10),
    });
  })
);

module.exports = router;
