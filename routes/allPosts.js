const express = require("express");

const { asyncHandler } = require("../variable/erroHandler.js");
const { getTokenAndPayload } = require("../variable/certification.js");
const { getAllPosts } = require("../variable/getAllPosts.js");

const router = express.Router();

router.route("/").get(
  asyncHandler(async(req, res) => {
    const { page } = req.query;
    const { payload } = getTokenAndPayload(req);
    const allPosts = await getAllPosts(payload.user_id, Number(page))

    res.send(allPosts);
  })
)

module.exports = router;