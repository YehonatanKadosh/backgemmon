const { verifyJsonWebToken } = require("../services/JsonWebToken/JWT");

module.exports = async (req, res, next) => {
  const Token = req.header("x-access-token");
  if (!Token) return res.status(401).send("access denied. no token provided");
  try {
    req.user = await verifyJsonWebToken(Token);
    next();
  } catch (err) {
    res.status(400).send("invalid token");
  }
};
