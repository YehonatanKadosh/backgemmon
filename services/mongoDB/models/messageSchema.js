const mongo = require("mongoose");

module.exports.messageSchema = new mongo.Schema({
  sender: Number,
  message: String,
  destinationUser: Number,
});
