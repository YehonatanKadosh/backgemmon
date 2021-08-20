const { messageSchema } = require("../models/messageSchema");
const mongo = require("mongoose");
const Message = mongo.model("Message", messageSchema);

const newMessage = async ({ senderId, message, conversationId, time }) => {
  return new Promise(async (res, rej) => {
    try {
      let addedmessage = new Message({
        senderId,
        message,
        conversationId,
        time,
      });
      await addedmessage.save();
      res(addedmessage);
    } catch (err) {
      rej(err);
    }
  });
};

const getMessages = async (conversationId) => {
  return new Promise(async (res, rej) => {
    try {
      let messages = await Message.find({ conversationId });
      res(messages);
    } catch (err) {
      rej(err);
    }
  });
};

module.exports = { newMessage, getMessages };
