const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const Token = req.header("x-access-token");
  if (!Token) return res.status(401).send("access denied. no token provided");
  try {
    const decodedPayload = jwt.verify(Token, config.get("JSONWEBTOKENS"));
    req.user = decodedPayload;
    next();
  } catch (err) {
    res.status(400).send("invalid token");
  }
};
