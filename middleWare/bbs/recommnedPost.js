const { asyncHandler } = require("../../utils/asyncHandler.js");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");
const { modelMap } = require("../../variable/modelMap.js");

const recommendPost = asyncHandler(async (req, res) => {
  const { mainCategory, post_id } = req.params;
  const { accessToken, payload } = getTokenAndPayload(req);

  if (!accessToken) {
    return res.status(401).send({ message: "Unauthorized." });
  };

  const post = await modelMap[mainCategory].findById(post_id);

  if (!post) {
    return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
  };

  if (post.recommend.includes(payload._id)) {
    await modelMap[mainCategory].findByIdAndUpdate(post_id, {
      $pull: { recommend: payload._id },
    });

    await Notification.findOneAndUpdate(
      { user: post.writer._id },
      { $pull: { list: { triggeredBy: payload._id, type: "추천" } } }
    );

    return res.send({ message: "게시글 추천을 취소했습니다." });
  } else {
    await modelMap[mainCategory].findByIdAndUpdate(post_id, {
      $push: { recommend: payload._id },
    });

    await Notification.findOneAndUpdate(
      { user: post.writer._id },
      {
        $push: {
          list: { 
            triggeredBy: payload._id,
            type: "추천",
            targetTitle: post.title,
            targetUrl: req.body.targetUrl
          },
        },
      }
    );

    return res.send({ message: "게시글을 추천했습니다." });
  }
});

module.exports = recommendPost;