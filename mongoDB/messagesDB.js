const { messageSchema } = require("../models/messageSchema");
const mongo = require("mongoose");
const Message = mongo.model("Message", messageSchema);
const config = require("config");

const newMessage = (sender, message, dest) => {
  let newMessage = new Message({
    sender: sender,
    message: message,
    destinationUser: dest,
  });
  newMessage.save(() => {
    io.emit("message", {
      sender: sender,
      message: message,
      destinationUser: dest,
    });
  });
};
module.exports = { newMessage: newMessage };
