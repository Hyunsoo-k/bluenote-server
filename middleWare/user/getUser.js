const { asyncHandler } = require("../../utils/asyncHandler.js");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");
const { User } = require("../../model/user.js");

const getUser = asyncHandler(async (req, res) => {
  const { accessToken, payload } = getTokenAndPayload(req);

  if (!accessToken || !payload) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  const user = await User.findById(payload._id).lean();

  return res.send({
    _id: user._id,
    email: user.email,
    nickname: user.nickname,
    profileImage: { url: user.profileImage.url, fileName: user.profileImage.fileName },
    part: user.part,
    createdAt: user.createdAt,
    role: user.role,
  });
});

module.exports = getUser;
