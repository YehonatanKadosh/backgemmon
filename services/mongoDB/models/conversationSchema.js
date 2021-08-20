const Joi = require("joi");
const mongo = require("mongoose");

const conversationScema = new mongo.Schema({
  participants: [{ type: String }],
});

const conversationJoiScema = Joi.object({
  participants: Joi.array().min(2).required(),
});

module.exports = { conversationScema, conversationJoiScema };
