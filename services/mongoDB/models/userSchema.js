const Joi = require("joi");
const mongo = require("mongoose");

const userSchema = new mongo.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 900,
  },
  email: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 1000,
  },
  game: {
    OnGame: { type: Boolean, default: false },
    gameId: { type: String, default: "" },
  },
});

const userJoiScema = Joi.object({
  name: Joi.string().min(2).max(900).required(),
  email: Joi.string().min(2).max(50).email().required(),
  password: Joi.string().min(2).max(1000).required(),
});
module.exports = { userSchema, userJoiScema };
