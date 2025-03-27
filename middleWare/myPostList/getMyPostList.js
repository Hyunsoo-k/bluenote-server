const { asyncHandler } = require("../../utils/asyncHandler");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");
const optimizeBbsList = require("../../utils/optimizeBbsList.js");

const getMyPostList = asyncHandler(async (req, res) => {
  const { accessToken, payload } = getTokenAndPayload(req);

  if (!accessToken || !payload) {
    return res.status(401).send({ message: "Unauthorized." });
  };

  const postLimit = 15;
  const postModels = [NoticePost, NewsPost, BoardPost, PromotePost, JobPost];

  const postLists = await Promise.all(
    postModels.map(model =>
      model
        .find({ writer: userMe_id })
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

  return optimizedPostList;
});

module.exports = { getMyPostList };