const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { asyncHandler } = require("../utils/asyncHandler.js");
const { User } = require("../model/user.js");

const router = express.Router();
dotenv.config();

// 로그인

router.route("/signIn").post(
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "등록되지 않은 이메일 입니다." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).send({ message: "비밀번호가 일치하지 않습니다." });
    }

    const payload = {
      _id: user._id.toString(),
      nickname: user.nickname,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" });

    res.status(200).send({ token });
  })
);

// 회원가입

router.route("/signUp").post(
  asyncHandler(async (req, res) => {
    const { email, nickname, password } = req.body;
    const isEmailExist = await User.findOne({ email });
    const isNicknameExist = await User.findOne({ nickname });

    if (isEmailExist) {
      return res.status(409).send({ message: "이미 존재하는 이메일 입니다." });
    }

    if (isNicknameExist) {
      return res.status(409).send({ message: "이미 존재하는 닉네임 입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, nickname, password: hashedPassword });

    res.status(201).send({ newUser });
  })
);

module.exports = router;
