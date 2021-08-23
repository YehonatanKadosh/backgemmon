const _ = require("lodash");
const {
  createNewGame,
  gameMoveValidator,
  getReversedTurn,
  rollDices,
  turnEnded,
} = require("../GameLogic/GameLogic");
const { getGame } = require("../mongoDB/Database/gameDB");
const { getSocketId, updateSocket } = require("../mongoDB/Database/socketDB");
const { updateUser, getUser } = require("../mongoDB/Database/userDB");

const game_socket_events = async (socket, io) => {
  const sendGame = async (game) => {
    let opponent1Socket = await getSocketId(game.participants[0].userId);
    let opponent2Socket = await getSocketId(game.participants[1].userId);
    if (game.participants[0].isBlack) {
      io.to(opponent1Socket).emit("start-new-game", game);
      game.board = game.board.reverse();
      io.to(opponent2Socket).emit("start-new-game", game);
    } else {
      io.to(opponent2Socket).emit("start-new-game", game);
      game.board = game.board.reverse();
      io.to(opponent1Socket).emit("start-new-game", game);
    }

    io.emit("new-game-started", [
      game.participants[0].userId,
      game.participants[1].userId,
    ]);

    game.participants.forEach(async (participant, index) => {
      await updateUser(participant.userId.toString(), {
        OnGame: true,
        gameId: game._id.toString(),
      });
      await updateSocket(index === 0 ? opponent1Socket : opponent2Socket, true);
    });
  };

  // check if game is on for this user
  if (socket.request.user.game.gameId) {
    try {
      let game = await getGame(socket.request.user.game.gameId);
      let otherOpponent =
        game.participants[0].userId.toString() ===
        socket.request.user._id.toString()
          ? game.participants[1]
          : game.participants[0];
      let opponentSocket = await getSocketId(otherOpponent.userId.toString()); // is the opponent online?
      let opponent = await getUser(otherOpponent.userId.toString());

      if (opponent.game.gameId === socket.request.user.game.gameId) {
        if (opponent.game.OnGame) await sendGame(game);
        else {
          io.to(socket.id).emit("request-back-to-game", opponent);
          socket.on("request-back-to-game-approved", async () => {
            io.to(opponentSocket).emit(
              "request-back-to-game-approved-once",
              socket.request.user
            );
          });
        }
      } else {
        await updateUser(socket.request.user._id.toString(), {
          OnGame: false,
          gameId: "",
        });
        socket.request.user.game.OnGame = false;
        socket.request.user.game.gameId = "";
      }
    } catch (err) {
      if (err != "socket not found") console.log(err);
    }
  }

  socket.on("new-game", async (opponentsArray) => {
    try {
      let receiverSocket = await getSocketId(opponentsArray[1]);
      if (receiverSocket)
        io.to(receiverSocket).emit("new-game-request", opponentsArray[0]);
    } catch (err) {
      console.log(err, opponentsArray);
    }
  });

  socket.on("back-to-game", async () => {
    try {
      let upToDateUser = await getUser(socket.request.user._id);
      let game = await getGame(upToDateUser.game.gameId);
      await sendGame(game);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("new-game-move", async (moveObject) => {
    try {
      gameChanges = await gameMoveValidator(moveObject);
      let opponent = gameChanges.participants.find(
        (player) =>
          player.userId.toString() !== socket.request.user._id.toString()
      );
      let opponentSocketId = await getSocketId(opponent.userId.toString());

      io.to(socket.id).emit("new-move", gameChanges);
      io.to(opponentSocketId).emit("new-move", gameChanges);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("new-game-denied", async (denied_object) => {
    try {
      let receiverSocket = await getSocketId(denied_object.requester);
      if (receiverSocket)
        io.to(receiverSocket).emit("new-game-denied", denied_object.message);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("step-back", async (gameId) => {
    try {
      reversedTurn = await getReversedTurn(gameId);
      let opponent = reversedTurn.participants.find(
        (player) =>
          player.userId.toString() !== socket.request.user._id.toString()
      );
      let opponentSocketId = await getSocketId(opponent.userId.toString());

      io.to(socket.id).emit("new-move", reversedTurn);
      io.to(opponentSocketId).emit("new-move", reversedTurn);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("roll-dices", async (gameId) => {
    try {
      newDices = await rollDices(gameId);
      let opponent = newDices.participants.find(
        (player) =>
          player.userId.toString() !== socket.request.user._id.toString()
      );
      let opponentSocketId = await getSocketId(opponent.userId.toString());

      io.to(socket.id).emit("new-move", newDices);
      io.to(opponentSocketId).emit("new-move", newDices);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("end-turn", async (gameId) => {
    try {
      switchPlayer = await turnEnded(gameId);
      let opponent = switchPlayer.participants.find(
        (player) =>
          player.userId.toString() !== socket.request.user._id.toString()
      );
      let opponentSocketId = await getSocketId(opponent.userId.toString());

      io.to(socket.id).emit("new-move", switchPlayer);
      io.to(opponentSocketId).emit("new-move", switchPlayer);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("cancel-new-game", async (requestedId) => {
    try {
      let receiverSocket = await getSocketId(requestedId);
      if (receiverSocket) io.to(receiverSocket).emit("cancel-request");
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("new-game-promited", async (opponentId) => {
    try {
      let newGame = await createNewGame([
        socket.request.user._id.toString(),
        opponentId,
      ]);
      await sendGame(newGame);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("end-game", async (opponents) => {
    try {
      opponents.forEach(async (opponent) => {
        await updateUser(opponent.userId ? opponent.userId : opponent._id, {
          OnGame: false,
          gameId: "",
        });
        await updateSocket(
          await getSocketId(opponent.userId ? opponent.userId : opponent._id),
          false
        );
      });
      io.emit("game-ended", opponents);
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports = game_socket_events;
