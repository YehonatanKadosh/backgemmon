const Joi = require("joi");
const mongo = require("mongoose");

const socketSchema = new mongo.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  socketId: {
    type: String,
    required: true,
  },
  onGame: {
    type: Boolean,
    default: false,
  },
});

const socketJoiScema = Joi.object({
  name: Joi.string().required(),
  userId: Joi.string().required(),
  socketId: Joi.string().required(),
});

module.exports = { socketSchema, socketJoiScema };
