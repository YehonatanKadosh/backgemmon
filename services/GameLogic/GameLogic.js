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
            isBlack: i === 1 ? true : false,
          });
        else if (i === 17 || i === 8)
          board.push({
            amount: 3,
            isBlack: i === 17 ? true : false,
          });
        else if (i === 19 || i === 6 || i === 13 || i === 12)
          board.push({
            amount: 5,
            isBlack: i === 19 || i === 12 ? true : false,
          });
        else
          board.push({
            amount: 0,
            isBlack: undefined,
          });
      }
      let Game = await newGame([firstPlayer, secondPlayer], board, [
        { value: 0, played: false, rolled: false },
        { value: 0, played: false, rolled: false },
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
      let { board, cubes, lastMoves, participants } = game;
      let participantsBefore = [
        { ...participants[0] },
        {
          ...participants[1],
        },
      ];

      let player, opponent;
      if (participants[0]._id.toString() === moveObject.player._id.toString()) {
        player = participants[0];
        opponent = participants[1];
      } else {
        player = participants[1];
        opponent = participants[0];
      }

      // source
      let source = board.find(
        (cell) =>
          cell._id.toString() === moveObject.changes.sourceCell._id.toString()
      );
      let sourceBefore = {
        _id: source._id,
        isBlack: source.isBlack,
        amount: source.amount,
      };
      source.amount--;
      if (source.amount === 0) {
        source.isBlack = undefined;
        // if he got out of jail
        if (source._id === (player.isBlack ? board[0] : board[25])._id)
          player.jailPopulated = false;
      }

      //destination
      let destination, destinationBefore, opponentsJail, opponentsJailBefore;
      if (moveObject.changes.desinationCell) {
        destination = board.find(
          (cell) =>
            cell._id.toString() ===
            moveObject.changes.desinationCell._id.toString()
        );
        destinationBefore = {
          _id: destination._id,
          isBlack: destination.isBlack,
          amount: destination.amount,
        };

        if (
          player.isBlack === destination.isBlack ||
          destination.isBlack === undefined
        ) {
          destination.amount++;
          destination.isBlack = player.isBlack;
        } else if (
          player.isBlack !== destination.isBlack &&
          destination.amount === 1
        ) {
          destination.isBlack = player.isBlack;

          //opponentsJail
          opponentsJail = player.isBlack ? board[25] : board[0];
          opponentsJailBefore = {
            _id: opponentsJail._id,
            isBlack: opponentsJail.isBlack,
            amount: opponentsJail.amount,
          };
          opponentsJail.amount++;
          opponentsJail.isBlack = !player.isBlack;
          opponent.jailPopulated = true;
        } else {
          return;
        }
      } else {
        // no destination
        player.piecesInBank++;
      }

      let playedCube = cubes.find(
        (cube) => cube._id.toString() === moveObject.playedCube._id.toString()
      );
      if (playedCube.isDouble) {
        if (playedCube.playedTwice) return;
        else if (playedCube.playedOnce) playedCube.playedTwice = true;
        else playedCube.playedOnce = true;
      } else {
        if (playedCube.playedOnce) return;
        else playedCube.playedOnce = true;
      }

      // Check if opponent is in jail and cant get out or finished playing
      // player have pieces in jail

      let firstCubeCorrectPossition = player.isBlack
        ? board[cubes[0].value]
        : board[25 - cubes[0].value];
      let secondCorrectPossition = player.isBlack
        ? board[cubes[1].value]
        : board[25 - cubes[1].value];
      let correctJail = player.isBlack ? board[0] : board[25];

      // player cant move from jail
      if (player.jailPopulated)
        if (
          checkIfPlayerCantGetOutOfJail(
            firstCubeCorrectPossition,
            secondCorrectPossition,
            correctJail,
            cubes
          )
        )
          player.turnEnded = true; // End turn for the player

      // player finished playing
      if (cubes[1].playedOnce && cubes[0].playedOnce) {
        if (cubes[1].isDouble) {
          if (cubes[1].playedTwice && cubes[0].playedTwice)
            player.turnEnded = true;
        } else {
          player.turnEnded = true;
        } // End turn for the player
      }

      // player or opponent have all the pieces at home
      let blacksAtHome = true,
        whitesAtHome = true,
        blackplayerWon = true,
        whiteplayerWon = true;
      for (let i = 1; i < 26; i++) {
        if (board[i].isBlack !== undefined && i < 19 && board[i].isBlack)
          blacksAtHome = false;
        if (board[i].isBlack !== undefined && i > 6 && !board[i].isBlack)
          whitesAtHome = false;
        if (board[i].isBlack !== undefined && board[i].isBlack)
          blackplayerWon = false;
        if (board[i].isBlack !== undefined && !board[i].isBlack)
          whiteplayerWon = false;
      }
      player.allPiecesAtHome = player.isBlack ? blacksAtHome : whitesAtHome;
      player.winner = player.isBlack ? blackplayerWon : whiteplayerWon;
      opponent.allPiecesAtHome = opponent.isBlack ? blacksAtHome : whitesAtHome;
      opponent.winner = opponent.isBlack ? blackplayerWon : whiteplayerWon;

      // Save last move
      let lastMove = {
        source: sourceBefore,
        destination: destinationBefore,
        opponentsJail: opponentsJailBefore,
        cube: moveObject.playedCube,
        participants: participantsBefore,
      };
      if (!lastMoves) lastMoves = [lastMove];
      else
        lastMoves.push({
          source: sourceBefore,
          destination: destinationBefore,
          opponentsJail: opponentsJailBefore,
          cube: moveObject.playedCube,
        });

      await updateGame(game);
      res({
        source,
        destination,
        opponentsJail,
        cubes,
        participants,
      });
    } catch (err) {
      rej(err);
    }
  });
};

const getReversedTurn = async (gameId) => {
  return new Promise(async (res, rej) => {
    try {
      let game = await getGame(gameId);
      let lastMove = game.lastMoves.pop();
      if (lastMove) {
        let { board, cubes, participants } = game;

        // reverse source cell
        let source = board.find((cell) => {
          return cell._id.toString() === lastMove.source._id.toString();
        });
        source.amount = lastMove.source.amount;
        source.isBlack = lastMove.source.isBlack;

        // reverse destination cell
        let destination = board.find(
          (cell) => cell._id.toString() === lastMove.destination._id.toString()
        );
        destination.amount = lastMove.destination.amount;
        destination.isBlack = lastMove.destination.isBlack;

        // reverse opponentsJail cell
        let opponentsJail;
        if (lastMove.opponentsJail) {
          opponentsJail = board.find(
            (cell) =>
              cell._id.toString() === lastMove.opponentsJail._id.toString()
          );
          opponentsJail.amount = lastMove.opponentsJail.amount;
          opponentsJail.isBlack = lastMove.opponentsJail.isBlack;
        }

        // reverse cube
        reversedCube = cubes.find(
          (cube) => cube._id.toString() === lastMove.cube._id.toString()
        );
        reversedCube.playedOnce = lastMove.cube.playedOnce;
        if (lastMove.cube.isDouble)
          reversedCube.playedTwice = lastMove.cube.playedTwice;

        await updateGame(game);
        res({
          source,
          destination,
          opponentsJail,
          cubes,
          participants,
        });
      }
      rej("no last move");
    } catch (err) {
      rej(err);
    }
  });
};

const checkIfPlayerCantGetOutOfJail = (
  firstCubeCorrectPossition,
  secondCorrectPossition,
  correctJail,
  cubes
) => {
  return (
    (firstCubeCorrectPossition.isBlack !== correctJail.isBlack &&
      firstCubeCorrectPossition.amount > 1 &&
      secondCorrectPossition.isBlack !== correctJail.isBlack &&
      secondCorrectPossition.amount > 1) ||
    (firstCubeCorrectPossition.isBlack !== correctJail.isBlack &&
      firstCubeCorrectPossition.amount > 1 &&
      cubes[1].playedOnce) ||
    (secondCorrectPossition.isBlack !== correctJail.isBlack &&
      secondCorrectPossition.amount > 1 &&
      cubes[0].playedOnce)
  );
};

const turnEnded = async (gameId) => {
  return new Promise(async (res, rej) => {
    try {
      let game = await getGame(gameId);
      let { participants, cubes } = game;

      participants.forEach((participant) => {
        participant.myTurn = !participant.myTurn;
        participant.turnEnded = participant.myTurn ? false : undefined;
      });

      game.lastMoves = [];

      cubes.forEach((cube) => {
        cube.playedOnce = false;
        cube.playedTwice = false;
        cube.isDouble = false;
        cube.value = 0;
        cube.rolled = false;
      });

      await updateGame(game);
      res({
        cubes,
        participants,
      });
    } catch (err) {
      rej(err);
    }
  });
};

const rollDices = async (gameId) => {
  return new Promise(async (res, rej) => {
    try {
      let game = await getGame(gameId);

      let { participants, cubes, board } = game;

      cubes[0].value = 1 + Math.floor(Math.random() * 6);
      cubes[0].rolled = true;
      cubes[0].playedOnce = false;
      cubes[0].playedTwice = false;

      cubes[1].value = 1 + Math.floor(Math.random() * 6);
      cubes[1].rolled = true;
      cubes[1].playedOnce = false;
      cubes[1].playedTwice = false;

      if (cubes[0].value === cubes[1].value) {
        cubes[0].isDouble = true;
        cubes[1].isDouble = true;
      } else {
        cubes[0].isDouble = false;
        cubes[1].isDouble = false;
      }

      let player;
      participants[0].myTurn
        ? (player = participants[0])
        : (player = participants[1]);

      let firstCubeCorrectPossition = player.isBlack
        ? board[cubes[0].value]
        : board[25 - cubes[0].value];
      let secondCorrectPossition = player.isBlack
        ? board[cubes[1].value]
        : board[25 - cubes[1].value];
      let correctJail = player.isBlack ? board[0] : board[25];

      // player cant move from jail
      if (player.jailPopulated)
        if (
          checkIfPlayerCantGetOutOfJail(
            firstCubeCorrectPossition,
            secondCorrectPossition,
            correctJail,
            cubes
          )
        )
          player.turnEnded = true; // End turn for the player

      await updateGame(game);
      res({
        cubes: game.cubes,
        participants: game.participants,
      });
    } catch (err) {
      rej(err);
    }
  });
};

module.exports = {
  createNewGame,
  gameMoveValidator,
  getReversedTurn,
  turnEnded,
  rollDices,
};
