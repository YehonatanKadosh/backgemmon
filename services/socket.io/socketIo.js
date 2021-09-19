const {
  newSocket,
  removeSocket,
  getSocketId,
} = require("../mongoDB/Database/socketDB");
const _ = require("lodash");
const chat_socket_events = require("./chat_socket_handlers");
const jwtAuth = require("socketio-jwt-auth");
const mongoose = require("mongoose");
const { userSchema } = require("../mongoDB/models/userSchema");
const game_socket_events = require("./game_socket_handlers");
const { updateUser, getUser } = require("../mongoDB/Database/userDB");
const User = mongoose.model("User", userSchema);

const Init = (server) => {
  let io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // authntication middleware
  io.use(
    jwtAuth.authenticate(
      { secret: process.env.JSONWEBTOKENS },
      (user, done) => {
        User.find({ _id: user._id }, (err, user) => {
          if (err) {
            // return error
            return done(err);
          }
          if (!user[0]) {
            // return fail
            return done(null, false, "user does not exist");
          }
          // return success with a user info
          return done(null, user[0]);
        });
      }
    )
  );

  io.on("connection", async (socket) => {
    try {
      await getSocketId(socket.request.user._id.toString());
      io.to(socket.id).emit("connected-on-another-device");
      socket.disconnect();
    } catch (err) {
      let createdSocket = await newSocket(
        socket.request.user.name,
        socket.request.user._id.toString(),
        socket.id
      );
      io.emit(
        "new-connection",
        _.pick(createdSocket, ["name", "userId", "_id"])
      );
    }

    socket.on("disconnect", async () => {
      try {
        await removeSocket(socket.id);
        io.emit("user-disconnected", socket.request.user._id.toString());

        let updatedUser = await getUser(socket.request.user._id);
        await updateUser(socket.request.user._id, {
          OnGame: false,
          gameId: updatedUser.game.gameId,
        });
      } catch (err) {
        console.log(err);
      }
    });

    chat_socket_events(socket, io);
    game_socket_events(socket, io);
  });

  return io;
};

module.exports = { Init };
