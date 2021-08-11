const mongo = require("mongoose");

const messageSchema = new mongo.Schema({
  senderId: String,
  message: String,
  conversationId: String,
  time: Date,
});

module.exports = { messageSchema };
