const { newMessage } = require("../mongoDB/Database/messagesDB");
const _ = require("lodash");
const { getSocketId } = require("../mongoDB/Database/socketDB");

const chat_socket_events = (socket, io) => {
  socket.on("send-message", async (message) => {
    try {
      let savedMessage = await newMessage(message);
      let sendingMessage = _.pick(savedMessage, [
        "senderId",
        "message",
        "conversationId",
        "_id",
        "time",
      ]);
      sendingMessage.receiverId = message.receiverId;
      try {
        let receiverSocket = await getSocketId(message.receiverId);
        if (receiverSocket)
          io.to(receiverSocket).emit("message", sendingMessage);
      } catch (err) {
        console.log(err);
      }
      io.to(socket.id).emit("message", sendingMessage);
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports = chat_socket_events;
