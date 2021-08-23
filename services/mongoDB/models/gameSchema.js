const mongo = require("mongoose");

const cellSchema = new mongo.Schema({
  amount: Number,
  isBlack: Boolean,
});

const cubeSchema = new mongo.Schema({
  value: Number,
  isDouble: Boolean,
  playedOnce: Boolean,
  playedTwice: Boolean,
  rolled: Boolean,
});

const participantSchema = new mongo.Schema({
  isBlack: Boolean,
  userId: String,
  fromLeft: Boolean,
  myTurn: Boolean,
  turnEnded: Boolean,
  jailPopulated: Boolean,
  allPiecesAtHome: Boolean,
  piecesInBank: { type: Number, default: 0 },
  winner: Boolean,
});

const moveSchema = new mongo.Schema({
  source: { type: cellSchema },
  destination: { type: cellSchema },
  opponentsJail: { type: cellSchema },
  cube: { type: cubeSchema },
  participants: [{ type: participantSchema }],
});

const gameSchema = new mongo.Schema({
  participants: [{ type: participantSchema }],
  board: [{ type: cellSchema }],
  cubes: [{ type: cubeSchema }],
  lastMoves: [{ type: moveSchema }],
});

const boardCellsEqual = (firstCell, secondCell) => {
  return (
    firstCell.amount === secondCell.amount &&
    firstCell.isBlack === secondCell.isBlack
  );
};
module.exports = { gameSchema, boardCellsEqual };
