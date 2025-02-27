const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

const { asyncHandler } = require("../../utils/asyncHandler.js");
const { modelMap } = require("../../utils/mapping.js");
const { Notification } = require("../../model/notification.js");
const createUserRecentSearch = require("../user/createRecentSearch.js");

dotenv.config();

const signUp = asyncHandler(async (req, res) => {
  const { email, nickname, password } = req.body;
  const isEmailExist = await modelMap["user"].findOne({ email });

  if (isEmailExist) {
    return res.status(409).send({ message: "이미 존재하는 이메일 입니다." });
  }

  const isNicknameExist = await modelMap["user"].findOne({ nickname });

  if (isNicknameExist) {
    return res.status(409).send({ message: "이미 존재하는 닉네임 입니다." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await modelMap["user"].create({ email, nickname, password: hashedPassword });

  const newNotification = Notification.create({ user: newUser._id });

  const newUserRecentSearch = createUserRecentSearch.create({ user: newUser._id });

  await Promise.all([newNotification, newUserRecentSearch]);

  res.status(201).send({ newUser });
});

module.exports = signUp;
