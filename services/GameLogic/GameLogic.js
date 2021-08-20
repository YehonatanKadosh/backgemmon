const { newGame, updateGame, getGame } = require("../mongoDB/Database/gameDB");
const { boardCellsEqual } = require("../mongoDB/models/gameSchema");

const createNewGame = async (participants) => {
  return new Promise(async (res, rej) => {
    try {
      let fromLeft = Math.floor(Math.random() * 2) === 0;
      let firstPlayer = {
        isBlack: Math.floor(Math.random() * 2) === 0,
        userId: participants[0],
        fromLeft,
        myTurn: fromLeft,
      };
      let secondPlayer = {
        isBlack: !firstPlayer.isBlack,
        userId: participants[1],
        fromLeft: !fromLeft,
        myTurn: !fromLeft,
      };
      let board = [];
      for (let i = 0; i < 26; i++) {
        if (i === 1 || i === 24)
          board.push({
            amount: 2,
            isBlack: i === 1 ? firstPlayer.isBlack : secondPlayer.isBlack,
          });
        else if (i === 17 || i === 8)
          board.push({
            amount: 3,
            isBlack: i === 17 ? firstPlayer.isBlack : secondPlayer.isBlack,
          });
        else if (i === 19 || i === 6 || i === 13 || i === 12)
          board.push({
            amount: 5,
            isBlack:
              i === 19 || i === 12 ? firstPlayer.isBlack : secondPlayer.isBlack,
          });
        else
          board.push({
            amount: 0,
            isBlack: undefined,
          });
      }
      let Game = await newGame([firstPlayer, secondPlayer], board, [
        { value: 1 + Math.floor(Math.random() * 6), played: false },
        { value: 1 + Math.floor(Math.random() * 6), played: false },
      ]);
      res(Game);
    } catch (err) {
      rej(err);
    }
  });
};

const gameMoveValidator = async (moveObject) => {
  return new Promise(async (res, rej) => {
    //  moveObject ={
    //  gameId ,
    //  changes = {
    //     sourceCell
    //      desinationCell
    //       opponentsJail
    // playedCube,
    //       player,
    // }
    try {
      let game = await getGame(moveObject.gameId);
      if (game) {
        let newBoard = game.board;
        //mocking clients moves

        let opponentsJail;
        // source
        let source = newBoard.find(
          (cell) =>
            cell._id.toString() === moveObject.changes.sourceCell._id.toString()
        );
        source.amount--;
        if (source.amount === 0) source.isBlack = undefined;

        //destination
        let destination = newBoard.find(
          (cell) =>
            cell._id.toString() ===
            moveObject.changes.desinationCell._id.toString()
        );
        if (
          moveObject.player.isBlack === destination.isBlack ||
          destination.isBlack === undefined
        ) {
          destination.amount++;
          destination.isBlack = moveObject.player.isBlack;
        } else if (
          moveObject.player.isBlack !== destination.isBlack &&
          destination.amount === 1
        ) {
          destination.isBlack = moveObject.player.isBlack;

          //opponentsJail
          opponentsJail = moveObject.player.isBlack
            ? newBoard[0]
            : newBoard[25];
          opponentsJail.amount++;
          opponentsJail.isBlack = !moveObject.player.isBlack;
        } else {
          console.log("bug");
        }

        // validating
        if (
          !boardCellsEqual(moveObject.changes.sourceCell, source) ||
          !boardCellsEqual(moveObject.changes.desinationCell, destination) ||
          (moveObject.changes.opponentsJail
            ? !boardCellsEqual(moveObject.changes.opponentsJail, opponentsJail)
            : false)
        )
          rej("source / destination / jail cell changed illegaly");

        // Everything checks out
        game.cubes.find(
          (cube) => cube._id.toString() === moveObject.playedCube._id.toString()
        ).played = true;
        if (game.cubes[0].played && game.cubes[1].played) {
          //finished turn
          game.cubes[0].played = false;
          game.cubes[1].played = false;
          game.cubes[0].value = 1 + Math.floor(Math.random() * 6);
          game.cubes[1].value = 1 + Math.floor(Math.random() * 6);
          game.participants.forEach((participant) => {
            participant.myTurn = !participant.myTurn;
          });
        }

        await updateGame(game);
        res({
          source,
          destination,
          opponentsJail,
          cubes: game.cubes,
          participants: game.participants,
        });
      }
      rej("no such game");
    } catch (err) {
      rej(err);
    }
  });
};

module.exports = { createNewGame, gameMoveValidator };
