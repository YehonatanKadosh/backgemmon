const mongo = require("mongoose");
const { userSchema } = require("../models/userSchema");
const User = mongo.model("User", userSchema);
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const config = require("config");
let salt = "";

const saveNewUser = async ({ email, password, name }) => {
  return new Promise(async (res) => {
    if (salt === "") salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const newUser = new User({
      email: email,
      password: hashed,
      name: name,
    });
    await newUser.save();
    res(await get_json_web_token(newUser));
  });
};

const emailExists = async (email) => await User.find({ email });

const logIn = async (user, password) => {
  if (await bcrypt.compare(password, user.password))
    return await get_json_web_token(user);
};

const get_json_web_token = async (user) => {
  return await jwt.sign(
    _.pick(user, ["_id", "name"]),
    config.get("JSONWEBTOKENS")
  );
};

module.exports = {
  saveNewUser,
  emailExists,
  logIn,
};
