const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { asyncHandler } = require("../utils/asyncHandler.js");
const { modelMap } = require("../utils/mapping.js");
const { Notification } = require("../model/notification.js");

const router = express.Router();
dotenv.config();

// 로그인

router.route("/signIn").post(
  asyncHandler(async (req, res) => {
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

    res.status(200).send({ accessToken });
  })
);

// 회원가입

router.route("/signUp").post(
  asyncHandler(async (req, res) => {
    const { email, nickname, password } = req.body;
    const isEmailExist = await modelMap["user"].findOne({ email });

    if (isEmailExist) {
      return res.status(409).send({ message: "이미 존재하는 이메일 입니다." });
    };

    const isNicknameExist = await modelMap["user"].findOne({ nickname });

    if (isNicknameExist) {
      return res.status(409).send({ message: "이미 존재하는 닉네임 입니다." });
    };

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await modelMap["user"].create({ email, nickname, password: hashedPassword });

    await Notification.create({ user: newUser._id });

    res.status(201).send({ newUser });
  })
);

module.exports = router;
