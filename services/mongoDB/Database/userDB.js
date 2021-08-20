const mongo = require("mongoose");
const { userSchema } = require("../models/userSchema");
const User = mongo.model("User", userSchema);
const { getEncryptedPassword } = require("../../passwordEncrypt");

const saveNewUser = async ({ email, password, name }) => {
  return new Promise(async (res, rej) => {
    try {
      let encryptedPassword = await getEncryptedPassword(password);
      const user = await new User({
        email,
        password: encryptedPassword,
        name,
      });
      await user.validate();
      await user.save();
      res(user);
    } catch (err) {
      rej(err);
    }
  });
};

const findUser = async (email) =>
  new Promise(async (res, rej) => {
    foundUser = (await User.find({ email }))[0];
    if (foundUser) res(foundUser);
    else rej("email not found");
  });

const getUser = async (userId) =>
  new Promise(async (res, rej) => {
    foundUser = (await User.find({ _id: userId }))[0];
    if (foundUser) res(foundUser);
    else rej("user not found");
  });

const updateUser = async (userId, newOnGame) => {
  return new Promise(async (res, rej) => {
    try {
      await User.updateOne(
        { _id: userId },
        {
          $set: {
            game: newOnGame,
          },
        }
      );

      res(true);
    } catch (err) {
      rej(err);
    }
  });
};

module.exports = {
  saveNewUser,
  findUser,
  updateUser,
  getUser,
};
