const { asyncHandler } = require("../../utils/asyncHandler");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");
const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../../model/bbs.js");
const optimizeBbsList = require("../../utils/optimizeBbsList.js");

const getMyPostList = asyncHandler(async (req, res) => {
  const { accessToken, payload } = getTokenAndPayload(req);
  const { page = 1 } = req.query;

  if (!accessToken || !payload) {
    return res.status(401).send({ message: "Unauthorized." });
  };

  const postModels = [NoticePost, NewsPost, BoardPost, PromotePost, JobPost];
  const postLimit = 15;

  const postLists = await Promise.all(
    postModels.map(model =>
      model
        .find({ writer: payload._id })
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * postLimit)
        .limit(postLimit)
        .populate({ path: "writer", select: "_id nickname" })
        .populate({ path: "commentList.writer", select: "_id nickname" })
        .lean()
    )
  );

  const optimizedPostList = await Promise.all(
    postLists.flat().map(post => optimizeBbsList(post))
  );

  return res.send(optimizedPostList);
});

module.exports = { getMyPostList };