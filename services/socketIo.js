const {
  newSocket,
  removeSocket,
  getSocketId,
} = require("./mongoDB/Database/socketDB");
const _ = require("lodash");
const { newMessage } = require("./mongoDB/Database/messagesDB");

const Init = (server) => {
  let io = require("socket.io")(server, {
    cors: {
      origin: "*", // check redundant
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    if (await getSocketId(socket.handshake.query.userId)) {
      io.to(socket.id).emit("connected-on-another-device");
    } else
      newSocket(
        socket.handshake.query.name,
        socket.handshake.query.userId,
        socket.id
      ).then((result) => {
        io.emit("new-connection", _.pick(result, ["name", "userId", "_id"]));
      });

    socket.on("disconnect", async () => {
      io.emit("user-disconnected", await removeSocket(socket.id));
    });

    socket.on("send-message", async (message) => {
      let savedMessage = await newMessage(
        message.senderId,
        message.message,
        message.conversationId,
        message.time
      );
      let sendingMessage = _.pick(savedMessage, [
        "senderId",
        "message",
        "conversationId",
        "_id",
        "time",
      ]);
      sendingMessage.receiverId = message.receiverId;
      let receiverSocket = await getSocketId(message.receiverId);
      if (receiverSocket) io.to(receiverSocket).emit("message", sendingMessage);
      io.to(socket.id).emit("message", sendingMessage);
    });
  });
};

module.exports = { Init };
