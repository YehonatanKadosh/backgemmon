import ChatToggler from "./ChatToggler/ChatToggler";
import "./Board.scss";
import { Button, Snackbar, Typography } from "@material-ui/core";
import ChooseOpponent from "./ChooseOpponent/ChooseOpponent";
import EventEmitter from "reactjs-eventemitter";
import GameRequest from "./GameRequest/GameRequest";
import React from "react";
import { ExitToApp } from "@material-ui/icons";
import BoardMatt from "./BoardMatt/BoardMatt";
import Alert from "@material-ui/lab/Alert";

export class Board extends React.Component {
  state = {
    game: undefined,
    winner: undefined,
    choosingOpponent: false,
    requester: undefined,
    opponentDisconnected: false,
  };

  subscribeToSocketEvents() {
    this.props.socketIO.on("new-game-request", (requesterId) => {
      if (this.state.game)
        this.props.socketIO.emit("new-game-denied", {
          message: `${this.props.user.name} started another game`,
          requester: requesterId,
        });
      else if (this.state.requester)
        this.props.socketIO.emit("new-game-denied", {
          message: `${this.props.user.name} has another request for now`,
          requester: requesterId,
        });
      else {
        let requester = this.props.sockets.find(
          (s) => s.userId === requesterId
        );
        this.setState({ requester });
      }
    });

    this.props.socketIO.on("start-new-game", (game) => {
      let player, opponent;
      if (game.participants[0].userId === this.props.user._id) {
        player = game.participants[0];
        opponent = game.participants[1];
      } else {
        player = game.participants[1];
        opponent = game.participants[0];
      }

      let opponentSocket = this.props.sockets.find(
        (s) => s.userId === opponent.userId
      );
      let playerSocket = this.props.sockets.find(
        (s) => s.userId === player.userId
      );

      player.name = playerSocket.name;
      opponent.name = opponentSocket.name;

      game.player = player;
      game.opponent = opponent;

      this.setState(
        {
          opponentDisconnected: false,
          choosingOpponent: false,
          game,
          requester: undefined,
        },
        () => EventEmitter.dispatch("back-to-game-request-ended")
      );
    });

    this.props.socketIO.on("new-move", (gameChanges) => {
      // gameChanges = { source, destination, opponentsJail, cubes, participant }

      let game = this.state.game;
      let { board, cubes, participants, player, opponent } = game;

      // update the board
      if (gameChanges.source) {
        let changedSource = board.find(
          (cell) => cell._id.toString() === gameChanges.source._id.toString()
        );
        changedSource.amount = gameChanges.source.amount;
        changedSource.isBlack = gameChanges.source.isBlack;
      }

      if (gameChanges.destination) {
        let changedDestination = board.find(
          (cell) =>
            cell._id.toString() === gameChanges.destination._id.toString()
        );
        changedDestination.amount = gameChanges.destination.amount;
        changedDestination.isBlack = gameChanges.destination.isBlack;
      }

      let changedOpponentsJail;
      if (gameChanges.opponentsJail) {
        changedOpponentsJail = board.find(
          (cell) =>
            cell._id.toString() === gameChanges.opponentsJail._id.toString()
        );
        changedOpponentsJail.amount = gameChanges.opponentsJail.amount;
        changedOpponentsJail.isBlack = gameChanges.opponentsJail.isBlack;
      }

      //update the cubes
      if (gameChanges.cubes) {
        gameChanges.cubes.forEach((cube, index) => {
          if (cubes[index].playedOnce !== cube.playedOnce)
            cubes[index].playedOnce = cube.playedOnce;
          if (cubes[index].isDouble !== cube.isDouble)
            cubes[index].isDouble = cube.isDouble;
          if (cubes[index].playedTwice !== cube.playedTwice)
            cubes[index].playedTwice = cube.playedTwice;
          if (cubes[index].value !== cube.value)
            cubes[index].value = cube.value;
          if (cubes[index].rolled !== cube.rolled)
            cubes[index].rolled = cube.rolled;
        });
      }

      //update participants
      gameChanges.participants.forEach((participant, index) => {
        if (participants[index].myTurn !== participant.myTurn) {
          participants[index].myTurn = participant.myTurn;
        }
      });

      //update player
      game.player = gameChanges.participants.find(
        (p) => p.userId.toString() === player.userId
      );
      game.opponent = gameChanges.participants.find(
        (p) => p.userId.toString() === opponent.userId
      );
      this.setState({ game });
    });
  }

  subscribeToEventEmmiterEvents() {
    EventEmitter.subscribe("cancle-opponent-choosing", () =>
      this.setState({ choosingOpponent: false })
    );

    EventEmitter.subscribe("request-ended", () =>
      this.setState({ requester: undefined })
    );

    EventEmitter.subscribe("user-disconnected", (removedOpponentId) => {
      if (removedOpponentId === this.state.game?.opponent.userId) {
        this.setState({ opponentDisconnected: true });
      }
    });

    EventEmitter.subscribe("game-ended", (opponents) => {
      this.setState({
        requester: undefined,
        opponentDisconnected: false,
        game: undefined,
      });
    });

    EventEmitter.subscribe("piece-clicked", (columnId) => {
      let { cubes, board, player } = this.state.game;
      let playedCube, biggerCube, smallerCube;

      if (cubes[0].isDouble) {
        if (cubes[0].playedTwice && cubes[1].playedTwice) return;
        if (!cubes[0].playedOnce || !cubes[0].playedTwice)
          playedCube = cubes[0];
        else playedCube = cubes[1];
      } else {
        if (cubes[0].playedOnce && cubes[1].playedOnce) return;
        if (!cubes[0].playedOnce && !cubes[1].playedOnce) {
          if (cubes[0].value > cubes[1].value) {
            biggerCube = cubes[0];
            smallerCube = cubes[1];
          } else {
            biggerCube = cubes[1];
            smallerCube = cubes[0];
          }
        } else if (cubes[0].playedOnce) playedCube = cubes[1];
        else playedCube = cubes[0];
      }

      if (playedCube)
        if (player.allPiecesAtHome) {
          if (
            columnId + playedCube.value < 25 &&
            board[columnId + playedCube.value].isBlack !==
              board[columnId].isBlack &&
            board[columnId + playedCube.value].amount > 1
          )
            return;
        } else {
          if (
            columnId + playedCube.value > 24 ||
            (board[columnId + playedCube.value].isBlack !==
              board[columnId].isBlack &&
              board[columnId + playedCube.value].amount > 1)
          )
            return;
        }
      else {
        // biggerCube smallerCube
        if (player.allPiecesAtHome) {
          if (
            columnId + biggerCube.value < 25 &&
            board[columnId + biggerCube.value].isBlack !==
              board[columnId].isBlack &&
            board[columnId + biggerCube.value].amount > 1
          ) {
            if (
              columnId + smallerCube.value < 25 &&
              board[columnId + smallerCube.value].isBlack !==
                board[columnId].isBlack &&
              board[columnId + smallerCube.value].amount > 1
            )
              return;
            else playedCube = smallerCube;
          } else playedCube = biggerCube;
        } else {
          if (
            columnId + biggerCube.value > 24 ||
            (board[columnId + biggerCube.value].isBlack !==
              board[columnId].isBlack &&
              board[columnId + biggerCube.value].amount > 1)
          ) {
            if (
              columnId + smallerCube.value > 24 ||
              (board[columnId + smallerCube.value].isBlack !==
                board[columnId].isBlack &&
                board[columnId + smallerCube.value].amount > 1)
            )
              return;
            else playedCube = smallerCube;
          } else playedCube = biggerCube;
        }
      }
      if (!playedCube) return;

      const sourceCell = board[columnId];
      const desinationCell =
        columnId + playedCube.value < 25
          ? board[columnId + playedCube.value]
          : undefined;

      this.props.socketIO.emit("new-game-move", {
        gameId: this.state.game._id,
        changes: {
          sourceCell,
          desinationCell,
        },
        playedCube,
        player: this.state.game.player,
      });
    });
  }

  componentDidMount() {
    this.subscribeToSocketEvents();
    this.subscribeToEventEmmiterEvents();
  }

  render() {
    return (
      <div className="board">
        <div className="board-header">
          <ChatToggler chatVisable={this.props.chatVisable} />
          {this.state.game && (
            <>
              <Typography variant="h6" component="h6">
                {this.state.game.opponent.name} VS {this.props.user.name}
              </Typography>
              <Button
                color="primary"
                className="game_switch"
                variant="contained"
                onClick={() =>
                  this.props.socketIO.emit("end-game", [
                    this.state.game.player,
                    this.state.game.opponent,
                  ])
                }
              >
                <ExitToApp className="chat_icon" />
                End
              </Button>
            </>
          )}
        </div>
        <div className="board-area">
          {this.state.game ? (
            this.state.opponentDisconnected ? (
              <Snackbar
                open={this.state.opponentDisconnected}
                autoHideDuration={6000}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              >
                <Alert variant="filled" severity="error">
                  {this.state.game.opponent.name} disconnected!
                </Alert>
              </Snackbar>
            ) : (
              <BoardMatt
                opponentDisconnected={this.state.opponentDisconnected}
                chatVisable={this.props.chatVisable}
                socketIO={this.props.socketIO}
                {...this.state.game}
              />
            )
          ) : (
            <>
              {this.state.choosingOpponent && !this.state.requester && (
                <ChooseOpponent
                  sockets={this.props.sockets}
                  choosingOpponent={this.state.choosingOpponent}
                  user={this.props.user}
                  socketIO={this.props.socketIO}
                />
              )}
              {this.state.requester && (
                <GameRequest
                  user={this.props.user}
                  socketIO={this.props.socketIO}
                  requester={this.state.requester}
                />
              )}
              <Button
                className="playBtn"
                color="primary"
                variant="contained"
                onClick={() => this.setState({ choosingOpponent: true })}
              >
                Play
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }
}
