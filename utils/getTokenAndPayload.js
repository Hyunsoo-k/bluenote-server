const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");

dotenv.config();

const getTokenAndPayload = (req) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const payload = jwt.verify(token, process.env.SECRET_KEY);

  return { accessToken, payload };
}

module.exports = { getTokenAndPayload };