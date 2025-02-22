const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { asyncHandler } = require("../utils/asyncHandler.js");
const { modelMap } = require("../utils/mapping.js");
const { Notification } = require("../model/notification.js");

dotenv.config();

const signUp = asyncHandler(async (req, res) => {
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
});

module.exports = signUp;