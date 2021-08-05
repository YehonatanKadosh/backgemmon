const mongo = require("mongoose");
const { userSchema } = require("../models/userSchema");
const User = mongo.model("User", userSchema);
const config = require("config");

mongo
  .connect(config.get("MongoKEY"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongoDb connected"))
  .catch((err) => console.error(err));

const saveNewUser = async (username, password, name) => {
  const newUser = new User({
    username: username,
    password: password,
    name: name,
  });
  await newUser.save();
};

const usernameExists = async (newUsername) => {
  return (await User.find({ username: newUsername })).length == 1;
};

const logIn = async (username, password) => {
  return (
    (await User.find({ username: username, password: password })).length == 1
  );
};

module.exports = {
  saveNewUser: saveNewUser,
  usernameExists: usernameExists,
  logIn: logIn,
};
