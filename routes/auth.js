const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { asyncHandler } = require("../variable/erroHandler.js");
const { User } = require("../model/user.js");

const router = express.Router();
dotenv.config();

// 로그인

router.route("/signIn").post(
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "can not find with given email" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).send({ message: "given password does not match" });
    }

    const payload = {
      user_id: user._id.toString(),
      nickname: user.nickname,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" });

    res.status(200).send({
      token,
      user: { user_id: user._id.toString(), email: user.email, nickname: user.nickname, role: user.role },
    });
  })
);

// 회원가입

router.route("/signUp").post(
  asyncHandler(async (req, res) => {
    const { email, nickname, password } = req.body;
    const isEmailExist = await User.findOne({ email });
    const isNicknameExist = await User.findOne({ nickname });

    if (isEmailExist) {
      return res.status(409).send({ message: "Email already exists." });
    }

    if (isNicknameExist) {
      return res.status(409).send({ message: "Nickname already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, nickname, password: hashedPassword });

    res.status(201).send({ newUser });
  })
);

module.exports = router;
