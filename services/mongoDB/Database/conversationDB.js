const mongo = require("mongoose");
const { getMessages } = require("./messagesDB");
const { conversationScema } = require("../models/conversationSchema");
const Conversation = mongo.model("Conversation", conversationScema);

const getConversation = async (participants) => {
  return new Promise(async (res, rej) => {
    let conversation =
      (
        await Conversation.find().where("participants").equals(participants)
      )[0] ||
      (
        await Conversation.find()
          .where("participants")
          .equals(participants.reverse())
      )[0];
    if (!conversation) {
      try {
        let newConversation = new Conversation({ participants });
        await newConversation.save();
        res({ messages: [], conversationId: newConversation._id.toString() });
      } catch (err) {
        rej(err);
      }
    } else {
      try {
        messages = await getMessages(conversation._id.toString());
        res({ messages, conversationId: conversation._id.toString() });
      } catch (err) {
        rej(err);
      }
    }
  });
};

module.exports = {
  getConversation,
};
