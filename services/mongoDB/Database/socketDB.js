const mongo = require("mongoose");
const { socketSchema } = require("../models/socketSchema");
const Socket = mongo.model("Socket", socketSchema);
const _ = require("lodash");

const newSocket = async (name, userId, socketId) => {
  return new Promise(async (res, rej) => {
    try {
      let newSocket = await new Socket({
        name,
        userId,
        socketId,
      });
      await newSocket.validate();
      await newSocket.save();
      res(newSocket);
    } catch (err) {
      rej(err);
    }
  });
};

const removeSocket = async (socketId) => {
  return new Promise(async (res, rej) => {
    let socket = (await Socket.find({ socketId }))[0];
    if (socket) {
      await Socket.deleteOne({ socketId });
      res(true);
    } else rej("socket not found");
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
  return new Promise(async (res, rej) => {
    let socket = (await Socket.find({ userId }))[0];
    if (socket) res(socket.socketId);
    else rej("socket not found");
  });
};

const updateSocket = async (socketId, newOnGame) => {
  return new Promise(async (res, rej) => {
    try {
      await Socket.updateOne(
        { socketId: socketId },
        {
          $set: {
            nGame: newOnGame,
          },
        }
      );
      res(true);
    } catch (err) {
      rej(err);
    }
  });
};

module.exports = {
  getSocketId,
  newSocket,
  removeSocket,
  getAllConnectedSockets,
  updateSocket,
};
