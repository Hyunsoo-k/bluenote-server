const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");

dotenv.config();

const getTokenAndPayload = (req) => {
  const token = req.headers.authorization.split(" ")[1];
  const payload = jwt.verify(token, process.env.SECRET_KEY);

  return { token, payload };
}

module.exports = { getTokenAndPayload };