const Joi = require("joi");
const mongo = require("mongoose");

const messageSchema = new mongo.Schema({
  senderId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  conversationId: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
});

const messageJoiScema = Joi.object({
  senderId: Joi.string().required(),
  conversationId: Joi.string().required(),
  message: Joi.string().required(),
  time: Joi.date().required(),
});

module.exports = { messageSchema, messageJoiScema };
