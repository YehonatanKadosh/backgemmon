import { CircularProgress } from "@material-ui/core";
import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import EventEmitter from "reactjs-eventemitter";
import "./BoardMatt.scss";
import Column from "./Column/Column";
import Cube from "./Cube/Cube";

export class BoardMatt extends React.Component {
  state = {
    opponent: undefined,
    player: undefined,
    board: [], // array of {amount, isBlack} length = 23
    cubes: [],
    participants: [],
    gameId: undefined,
    allPiecesAtHome: false,
    jailPopulated: false,
  };

  subscribeToEventEmmiterEvents() {
    EventEmitter.subscribe("game-ended", (opponents) => {
      this.setState({
        opponent: undefined,
        board: [],
        cubes: [],
        participant: [],
      });
    });

    EventEmitter.subscribe("start-new-game", (game) => {
      this.setState(
        {
          player: game.player,
          opponent: game.opponent,
          gameId: game.newGame._id,
          board: game.newGame.board,
          participants: game.newGame.participants,
          cubes: game.newGame.cubes,
        },
        this.afterChangesCheck
      );
    });
  }

  subscribeToSocketEvents() {
    this.props.socketIO.on("new-move", (gameChanges) => {
      // gameChanges = { source, destination, opponentsJail, cubes, participant }
      let board = this.state.board;
      let cubes = this.state.cubes;
      let participants = this.state.participants;

      // update the board
      let changedSource = board.find(
        (cell) => cell._id.toString() === gameChanges.source._id.toString()
      );
      changedSource.amount = gameChanges.source.amount;
      changedSource.isBlack = gameChanges.source.isBlack;

      let changedDestination = board.find(
        (cell) => cell._id.toString() === gameChanges.destination._id.toString()
      );
      changedDestination.amount = gameChanges.destination.amount;
      changedDestination.isBlack = gameChanges.destination.isBlack;

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
      gameChanges.cubes.forEach((cube, index) => {
        if (cubes[index].played !== cube.played) {
          cubes[index].played = cube.played;
        }
        if (cubes[index].value !== cube.value) {
          cubes[index].value = cube.value;
        }
      });

      //update participants
      gameChanges.participants.forEach((participant, index) => {
        if (participants[index].myTurn !== participant.myTurn) {
          participants[index].myTurn = participant.myTurn;
        }
      });

      let player = gameChanges.participants.find(
        (p) => p.userId.toString() === this.props.user._id
      );

      this.setState(
        {
          board: board,
          cubes,
          participants,
          player,
        },
        this.afterChangesCheck
      );
    });
  }

  afterChangesCheck = () => {
    // updatejail
    this.state.board[0].amount !== 0
      ? this.setState({ jailPopulated: true })
      : this.setState({ jailPopulated: false });
  };

  componentDidMount() {
    this.subscribeToEventEmmiterEvents();
    this.subscribeToSocketEvents();
  }

  handleOnDragEnd = (result) => {
    if (!result.destination || !result.source) return;
    const newBoard = this.state.board;
    const distance = result.destination.droppableId - result.source.droppableId;
    const sourceCell = result.source.droppableId;

    const desinationCell = parseInt(sourceCell) + parseInt(distance);
    let changes;
    if (
      distance < 1 ||
      (distance !== this.state.cubes[0].value &&
        distance !== this.state.cubes[1].value)
    )
      return;
    if (
      newBoard[desinationCell].isBlack === newBoard[sourceCell].isBlack ||
      newBoard[desinationCell].isBlack === undefined
    ) {
      newBoard[desinationCell].amount += 1;
      newBoard[sourceCell].amount -= 1;
      newBoard[desinationCell].isBlack = newBoard[sourceCell].isBlack;
      if (newBoard[sourceCell].amount === 0)
        newBoard[sourceCell].isBlack = undefined;
      changes = {
        sourceCell: newBoard[sourceCell],
        desinationCell: newBoard[desinationCell],
      };
    } else {
      if (newBoard[desinationCell].amount > 1) return;
      newBoard[25].amount++;
      newBoard[25].isBlack = newBoard[desinationCell].isBlack;
      newBoard[desinationCell].isBlack = newBoard[sourceCell].isBlack;
      newBoard[sourceCell].amount -= 1;
      if (newBoard[sourceCell].amount === 0)
        newBoard[sourceCell].isBlack = undefined;
      changes = {
        sourceCell: newBoard[sourceCell],
        desinationCell: newBoard[desinationCell],
        opponentsJail: newBoard[25],
      };
    }

    let playedCube =
      this.state.cubes[0].value === distance && !this.state.cubes[0].played
        ? this.state.cubes[0]
        : this.state.cubes[1];

    this.props.socketIO.emit("new-game-move", {
      gameId: this.state.gameId,
      changes,
      playedCube,
      player: this.state.player,
    });

    let cubes = this.state.cubes;
    cubes.find((cube) => cube._id === playedCube._id).played = true;

    this.setState({
      board: newBoard,
      cubes,
    });
  };

  render() {
    return (
      <DragDropContext onDragEnd={this.handleOnDragEnd}>
        <div
          className="board-container"
          style={{
            backgroundImage: `url(${
              process.env.PUBLIC_URL + "images/backgemmon-board.jpeg"
            })`,
          }}
        >
          <img
            src={process.env.PUBLIC_URL + "images/backgemmon-board.jpeg"}
            alt="board"
          />
          {!this.props.opponentDisconnected && (
            <>
              {this.state.board.map((cell, index) => (
                <Column
                  jailPopulated={this.state.jailPopulated}
                  id={index}
                  key={index}
                  chatVisable={this.props.chatVisable}
                  place={index < 13 ? index : index - 13}
                  class={index < 13 ? "top" : "bottom"}
                  columnItem={cell}
                  player={this.state.player}
                  fromLeft={
                    index < 13
                      ? this.state.player.fromLeft
                      : !this.state.player.fromLeft
                  }
                  allPiecesAtHome={this.state.allPiecesAtHome}
                />
              ))}
              {this.state.cubes[0] && (
                <>
                  <Cube class="first" cube={this.state.cubes[0]} />
                  <Cube class="second" cube={this.state.cubes[1]} />
                </>
              )}
              {this.state.opponent && !this.state.player?.myTurn ? (
                <span className="whos-playing">
                  {!this.state.player?.myTurn
                    ? `${this.state.opponent?.name}'s turn`
                    : "Your turn"}
                </span>
              ) : (
                ""
              )}
            </>
          )}
        </div>
        {this.state.opponent && this.props.opponentDisconnected && (
          <div className="reconnecting-container">
            <div>waiting for {this.state.opponent.name} to reconnect</div>
            <CircularProgress />
          </div>
        )}
      </DragDropContext>
    );
  }
}
