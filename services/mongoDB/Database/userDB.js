const mongo = require("mongoose");
const { userSchema } = require("../models/userSchema");
const User = mongo.model("User", userSchema);
const bcrypt = require("bcrypt");
const { getEncryptedPassword } = require("../../passwordEncrypt");

const saveNewUser = async ({ email, password, name }) => {
  return new Promise(async (res) => {
    const user = new User({
      email: email,
      password: await getEncryptedPassword(password),
      name: name,
    });
    await user.save();
    res(user);
  });
};

const findUser = async (email) =>
  new Promise(async (res) => res((await User.find({ email }))[0]));

module.exports = {
  saveNewUser,
  findUser,
};
