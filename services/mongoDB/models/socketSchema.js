const mongo = require("mongoose");

module.exports.socketSchema = new mongo.Schema({
  name: String,
  userId: String,
  socketId: String,
});
