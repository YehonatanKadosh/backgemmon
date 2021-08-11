const mongo = require("mongoose");

const conversationScema = new mongo.Schema({
  participants: [{ type: String }],
});

module.exports = { conversationScema };
