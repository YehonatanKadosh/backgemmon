const _ = require("lodash");
const jwt = require("jsonwebtoken");

const createJsonWebToken = async (user) => {
  return await jwt.sign(
    _.pick(user, ["_id", "name", "game"]),
    process.env.JSONWEBTOKENS
  );
};

const verifyJsonWebToken = async (token) => {
  return new Promise((res, rej) => {
    jwt.verify(token, process.env.JSONWEBTOKENS, function (err, decoded) {
      if (decoded) res(decoded);
      else rej(err);
    });
  });
};

module.exports = { createJsonWebToken, verifyJsonWebToken };
