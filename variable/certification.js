const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");

dotenv.config();

const getTokenAndPayload = (req) => {
  const token = req.headers.authorization.split(" ")[1];
  const payload = jwt.verify(token, process.env.SECRET_KEY);
  const isAdmin = payload.role === 1;

  return { token, payload, isAdmin };
}

module.exports = { getTokenAndPayload };