const express = require("express");

const dotenv = require("dotenv");
const login = require("../middleWare/auth/login.js");
const signUp = require("../middleWare/auth/signUp.js");

const router = express.Router();

dotenv.config();

// 로그인

router.post("/signIn", login);

// 회원가입

router.post("/signUp", signUp);

module.exports = router;
