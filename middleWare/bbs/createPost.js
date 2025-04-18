const { asyncHandler } = require("../../utils/asyncHandler.js");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");
const { modelMap, modelTextMap } = require("../../variable/modelMap.js");
const { SiteInformation } = require("../../model/siteInformation.js");
const { MyPost } = require('../../model/myPost.js');

const createPost = asyncHandler(async (req, res) => {
  const { mainCategory } = req.params;
  const { accessToken, payload } = getTokenAndPayload(req);

  if (!accessToken) {
    return res.status(401).send({ message: "Unauthorized." });
  };

  if (!req.body.title) {
    return res.status(401).send({ message: "제목을 입력해 주세요." });
  };

  if (req.body.content === "<p><br></p>") {
    return res.statue(401).send({ message: "내용을 입력해 주세요." });
  };
  
  const siteInformation = await SiteInformation.findOneAndUpdate(
    {},
    { $inc: { cumulatedPostsCount: 1 } },
    { new: true }
  );

  const newPost = await modelMap[mainCategory].create({ ...req.body, writer: payload._id, number: siteInformation.cumulatedPostsCount });

  await newPost.populate("writer");

  await MyPost.findOneAndUpdate(
    {
      user_id: newPost.writer._id
    },
    {
      $push: { postList: {
        refTarget: modelTextMap[mainCategory],
        post_id: newPost._id
      }}
    }
  );

  return res.status(201).send(newPost);
});

module.exports = createPost;