const mongo = require("mongoose");

module.exports.userSchema = new mongo.Schema({
  username: String,
  password: String,
  name: String,
});
