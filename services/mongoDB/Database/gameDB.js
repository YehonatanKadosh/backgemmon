const mongo = require("mongoose");
const { gameSchema } = require("../models/gameSchema");
const Game = mongo.model("Game", gameSchema);
const _ = require("lodash");

const newGame = async (participants, board, cubes) => {
  return new Promise(async (res, rej) => {
    try {
      let game = new Game({
        participants,
        board,
        cubes,
      });
      await game.save();
      res(game);
    } catch (err) {
      rej(err);
    }
  });
};

const getGame = async (gameId) => {
  return new Promise(async (res, rej) => {
    try {
      let existantGame = await Game.find({ _id: gameId });
      if (existantGame[0]) res(existantGame[0]);
      else rej("no such game");
    } catch (err) {
      console.log(err);
    }
  });
};

const updateGame = async (game) => {
  return new Promise(async (res, rej) => {
    try {
      await Game.updateOne(
        { _id: game._id },
        {
          $set: {
            board: game.board,
            participants: game.participants,
            cubes: game.cubes,
            lastMoves: game.lastMoves,
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
  newGame,
  getGame,
  updateGame,
};
