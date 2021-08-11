const { messageSchema } = require("../models/messageSchema");
const mongo = require("mongoose");
const Message = mongo.model("Message", messageSchema);

const newMessage = async (senderId, message, conversationId, time) => {
  return new Promise(async (res) => {
    let addedmessage = new Message({
      senderId,
      message,
      conversationId,
      time,
    });
    await addedmessage.save();
    res(addedmessage);
  });
};

const getMessages = async (conversationId) => {
  return new Promise(async (res) => {
    res(await Message.find({ conversationId }));
  });
};

module.exports = { newMessage, getMessages };
