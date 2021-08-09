const { messageSchema } = require("../models/messageSchema");
const mongo = require("mongoose");
const Message = mongo.model("Message", messageSchema);
const config = require("config");

const newMessage = async (sender, message, dest) => {
  return new Promise((res, rej) => {
    let newMessage = new Message({
      sender: sender,
      message: message,
      destinationUser: dest,
    });
    WriteResult = newMessage.save();
    WriteResult.nInserted > 0 ? res(newChannel) : rej(WriteResult.writeError);
  });
};

module.exports = { newMessage: newMessage };
