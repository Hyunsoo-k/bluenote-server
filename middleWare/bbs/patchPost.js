const { asyncHandler } = require("../utils/asyncHandler.js");
const { modelMap } = require("../utils/mapping.js");

const patchPost = asyncHandler(async (req, res) => {
  const { mainCategory, post_id } = req.params;
  const { accessToken, payload } = getTokenAndPayload(req);
  const post = await modelMap[mainCategory].findById(post_id).populate({ path: "writer", select: "_id nickname" });

  if (!post) {
    return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
  };

  if (!accessToken || post.writer._id.toString() !== payload._id) {
    return res.status(401).send({ message: "Unauthorized." });
  };

  if (!req.body.title) {
    return res.status(400).send({ message: "제목을 입력해 주세요." });
  };

  if (req.body.content === "<p><br></p>") {
    return res.status(400).send({ message: "내용을 입력해 주세요." });
  };

  const editedPost = await modelMap[mainCategory]
    .findByIdAndUpdate(post_id, { $set: req.body }, { new: true })
    .lean();

  return res.send(editedPost);
});

module.exports = patchPost;