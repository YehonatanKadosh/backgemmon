const mongo = require("mongoose");

module.exports.channelSchema = new mongo.Schema({
  name: String,
  userId: String,
  channelId: String,
});
