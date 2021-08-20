const Joi = require("joi");
const mongo = require("mongoose");

const boardSchema = new mongo.Schema({
  amount: Number,
  isBlack: Boolean,
});

const cubeSchema = new mongo.Schema({
  value: Number,
  played: Boolean,
});

const boardCellsEqual = (firstCell, secondCell) => {
  return (
    firstCell.amount === secondCell.amount &&
    firstCell.isBlack === secondCell.isBlack
  );
};

const participantSchema = new mongo.Schema({
  isBlack: Boolean,
  userId: String,
  fromLeft: Boolean,
  myTurn: Boolean,
});

const gameSchema = new mongo.Schema({
  participants: [{ type: participantSchema }],
  board: [{ type: boardSchema }],
  cubes: [{ type: cubeSchema }],
});

module.exports = { gameSchema, boardCellsEqual };
