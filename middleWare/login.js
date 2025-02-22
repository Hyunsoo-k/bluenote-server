const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { asyncHandler } = require("../utils/asyncHandler.js");
const { modelMap } = require("../utils/mapping.js");

dotenv.config();

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await modelMap["user"].findOne({ email });

  if (!user) {
    return res.status(404).send({ message: "등록되지 않은 이메일 입니다." });
  };

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(401).send({ message: "비밀번호가 일치하지 않습니다." });
  };

  const payload = {
    _id: user._id.toString(),
    nickname: user.nickname,
    role: user.role,
  };
  
  const accessToken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" });

  res.status(200).send({
    accessToken,
    userMe: {
      ...payload,
      profileImage: user.profileImage
    }
  });
});

module.exports = login;