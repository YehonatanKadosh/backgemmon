const config = require("config");
const {
  newChannel,
  removeChannel,
  getSocketId,
} = require("./mongoDB/Database/channelsDB");
const _ = require("lodash");

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
      newChannel(
        socket.handshake.query.name,
        socket.handshake.query.userId,
        socket.id
      ).then((result) => {
        io.emit("new-connection", _.pick(result, ["name", "userId"]));
      });

    socket.on("disconnect", async () => {
      io.emit("user-disconnected", await removeChannel(socket.id));
    });

    socket.on("send-message", async (message) => {
      let destinationSocket = await getSocketId(message.destinationUserId);
      if (destinationSocket) io.to(destinationSocket).emit("message", message);
      io.to(socket.id).emit("message", message);
    });
  });
};

module.exports = { Init };
