import ChatToggler from "./ChatToggler/ChatToggler";
import "./Board.scss";
import { Button, Snackbar, Typography } from "@material-ui/core";
import ChooseOpponent from "./ChooseOpponent/ChooseOpponent";
import EventEmitter from "reactjs-eventemitter";
import GameRequest from "./GameRequest/GameRequest";
import React from "react";
import { ExitToApp } from "@material-ui/icons";
import { BoardMatt } from "./BoardMatt/BoardMatt";
import Alert from "@material-ui/lab/Alert";

export class Board extends React.Component {
  state = {
    gameOn: false,
    choosingOpponent: false,
    opponent: undefined,
    requester: undefined,
    opponentDisconnected: false,
  };

  subscribeToSocketEvents() {
    this.props.socketIO.on("new-game-request", (requesterId) => {
      if (this.state.gameOn)
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

    this.props.socketIO.on("start-new-game", (newGame) => {
      let player, gameOpponent;
      if (newGame.participants[0].userId === this.props.user._id) {
        player = newGame.participants[0];
        gameOpponent = newGame.participants[1];
      } else {
        player = newGame.participants[1];
        gameOpponent = newGame.participants[0];
      }

      let opponent = this.props.sockets.find(
        (s) => s.userId === gameOpponent.userId
      );
      this.setState(
        {
          opponentDisconnected: false,
          choosingOpponent: false,
          gameOn: true,
          opponent,
        },
        () => {
          EventEmitter.dispatch("start-new-game", {
            player,
            opponent,
            newGame,
          });
          EventEmitter.dispatch("back-to-game-request-ended");
        }
      );
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
      if (removedOpponentId === this.state.opponent?.userId) {
        this.setState({ opponentDisconnected: true });
      }
    });

    EventEmitter.subscribe("game-ended", (opponents) => {
      this.setState({
        requester: undefined,
        opponentDisconnected: false,
        gameOn: false,
        opponent: undefined,
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
          {this.state.opponent && this.state.gameOn && (
            <>
              <Typography variant="h6" component="h6">
                {this.state.opponent.name} VS {this.props.user.name}
              </Typography>
              <Button
                color="primary"
                className="game_switch"
                variant="contained"
                onClick={() =>
                  this.props.socketIO.emit("end-game", [
                    this.props.user,
                    this.state.opponent,
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
          {this.state.gameOn && (
            <BoardMatt
              opponentDisconnected={this.state.opponentDisconnected}
              sockets={this.props.sockets}
              opponent={this.state.opponent}
              chatVisable={this.props.chatVisable}
              user={this.props.user}
              socketIO={this.props.socketIO}
            />
          )}
          {!this.state.gameOn && (
            <Button
              className="playBtn"
              color="primary"
              variant="contained"
              onClick={() => this.setState({ choosingOpponent: true })}
            >
              Play
            </Button>
          )}
          {!this.state.opponent && (
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
            </>
          )}
          {this.state.opponentDisconnected && (
            <>
              <Snackbar
                open={this.state.opponentDisconnected}
                autoHideDuration={6000}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              >
                <Alert variant="filled" severity="error">
                  {this.state.opponent.name} disconnected!
                </Alert>
              </Snackbar>
            </>
          )}
        </div>
      </div>
    );
  }
}
