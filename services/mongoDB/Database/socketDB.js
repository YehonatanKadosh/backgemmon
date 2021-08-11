const mongo = require("mongoose");
const { socketSchema } = require("../models/socketSchema");
const Socket = mongo.model("Socket", socketSchema);
const _ = require("lodash");

const newSocket = async (name, userId, socketId) => {
  return new Promise(async (res) => {
    let newSocket = await new Socket({
      name,
      userId,
      socketId,
    });
    newSocket.save();
    res(newSocket);
  });
};

const removeSocket = async (socketId) => {
  return new Promise(async (res) => {
    socket = (await Socket.find({ socketId }))[0];
    if (socket) {
      let userId = socket.userId;
      await Socket.deleteOne({ socketId });
      res(userId);
    }
  });
};

const getAllConnectedSockets = async () => {
  return new Promise(async (res) => {
    res(
      (await Socket.find({})).map((socket) =>
        _.pick(socket, ["name", "userId", "_id"])
      )
    );
  });
};

const getSocketId = async (userId) => {
  return new Promise(async (res) => {
    let socket = (await Socket.find({ userId }))[0];
    if (socket) res(socket.socketId);
    res(undefined);
  });
};

module.exports = {
  getSocketId,
  newSocket,
  removeSocket,
  getAllConnectedSockets,
};
