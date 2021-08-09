const mongo = require("mongoose");
const { channelSchema } = require("../models/channelSchema");
const Channel = mongo.model("Channel", channelSchema);
const _ = require("lodash");

const newChannel = async (name, userId, channelId) => {
  return new Promise(async (res) => {
    let newChannel = await new Channel({
      name,
      userId,
      channelId,
    });
    WriteResult = newChannel.save();
    res(newChannel);
  });
};

const removeChannel = async (socket_id) => {
  return new Promise(async (res) => {
    channel = (await Channel.find({ channelId: socket_id }))[0];
    if (channel) {
      id = channel.userId;
      await Channel.deleteOne({ channelId: socket_id });
      res(id);
    }
  });
};

const getAllConnectedChannels = async () => {
  return new Promise(async (res) => {
    res(
      (await Channel.find({})).map((channel) =>
        _.pick(channel, ["name", "userId"])
      )
    );
  });
};

const getSocketId = async (userId) => {
  return new Promise(async (res) => {
    let channel = await Channel.find({ userId });
    if (channel[0]) res(channel[0].channelId);
    res(undefined);
  });
};
module.exports = {
  getSocketId,
  newChannel,
  removeChannel,
  getAllConnectedChannels,
};
