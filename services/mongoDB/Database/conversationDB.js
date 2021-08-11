const mongo = require("mongoose");
const { getMessages } = require("./messagesDB");
const { conversationScema } = require("../models/conversationSchema");
const Conversation = mongo.model("Conversation", conversationScema);

const getConversation = async (participants) => {
  return new Promise(async (res) => {
    let conversation =
      (
        await Conversation.find().where("participants").equals(participants)
      )[0] ||
      (
        await Conversation.find()
          .where("participants")
          .equals(participants.reverse())
      )[0];

    if (conversation === undefined) {
      let newConversation = new Conversation({ participants });
      await newConversation.save();
      res({ messages: [], conversationId: newConversation._id });
    } else {
      res({
        messages: await getMessages(conversation._id),
        conversationId: conversation._id,
      });
    }
  });
};

module.exports = {
  getConversation,
};
