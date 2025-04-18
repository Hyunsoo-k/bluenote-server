const bcrypt = require("bcrypt");

const { asyncHandler } = require("../../utils/asyncHandler.js");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");
const { User } = require("../../model/user.js");

const patchUser = asyncHandler(async (req, res) => {
  const { nickname, newPassword } = req.body;
  const { payload } = getTokenAndPayload(req);

  if (!payload) {
    return res.status(401).send({ message: "Unauthorized." });
  };

  const isNicknameExist = await User.findOne({ nickname });

  if (isNicknameExist && isNicknameExist._id.toString() !== payload._id) {
    return res.status(409).send({ message: "이미 존재하는 닉네임 입니다." });
  };

  let newHashedPassword = null;

  if (newPassword) {
    newHashedPassword = await bcrypt.hash(newPassword, 10);
  };

  const editedUser = await User.findByIdAndUpdate(
    payload._id,
    {
      ...req.body,
      ...(newHashedPassword && { password: newHashedPassword }) 
    },
    { new: true, runValidators: true }
  ).lean();

  return res.send(editedUser);
});

module.exports = patchUser;
