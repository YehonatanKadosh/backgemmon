const _ = require("lodash");
const jwt = require("jsonwebtoken");
const config = require("config");

const createJsonWebToken = async (user) => {
  return await jwt.sign(
    _.pick(user, ["_id", "name"]),
    config.get("JSONWEBTOKENS")
  );
};

module.exports = { createJsonWebToken };
