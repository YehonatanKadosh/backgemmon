import { Button, LinearProgress } from "@material-ui/core";
import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import "./BoardMatt.scss";
import Column from "./Column/Column";
import Cube from "./Cube/Cube";

const BoardMatt = (props) => {
  const handleOnDragEnd = (result) => {
    if (!result.destination || !result.source) return;
    const board = props.board;

    const distance = result.destination.droppableId - result.source.droppableId;

    let playedCube;
    if (props.cubes[0].isDouble) {
      if (props.cubes[0].value === distance) {
        if (!props.cubes[0].playedOnce || !props.cubes[0].playedTwice)
          playedCube = props.cubes[0];
        else if (!props.cubes[1].playedOnce || !props.cubes[1].playedTwice)
          playedCube = props.cubes[1];
      }
    } else {
      if (props.cubes[0].value === distance && !props.cubes[0].playedOnce)
        playedCube = props.cubes[0];
      else if (props.cubes[1].value === distance && !props.cubes[1].playedOnce)
        playedCube = props.cubes[1];
    }

    if (distance < 1 || !playedCube) return;

    const sourceCell = board[result.source.droppableId];
    const desinationCell = board[result.destination.droppableId];
    if (
      desinationCell.isBlack !== sourceCell.isBlack &&
      desinationCell.amount > 1
    )
      return;

    props.socketIO.emit("new-game-move", {
      gameId: props._id,
      changes: {
        sourceCell,
        desinationCell,
      },
      playedCube,
      player: props.player,
    });
  };
  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
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
        {!(props.player.winner || props.opponent.winner) ? (
          <>
            <LinearProgress
              variant="determinate"
              value={(100 / 15) * props.player.piecesInBank}
              className={
                "finishing-progress finishing-player-progress " +
                (props.player.isBlack ? "black-progress" : "white-progress")
              }
            />
            <LinearProgress
              variant="determinate"
              value={(100 / 15) * props.opponent.piecesInBank}
              className={
                "finishing-progress finishing-opponent-progress " +
                (props.opponent.isBlack ? "black-progress" : "white-progress")
              }
            />
            {!props.opponentDisconnected && (
              <>
                {props.board.map((cell, index) => (
                  <Column
                    id={index}
                    key={index}
                    chatVisable={props.chatVisable}
                    place={index < 13 ? index : index - 13}
                    class={index < 13 ? "top" : "bottom"}
                    columnItem={cell}
                    player={props.player}
                    fromLeft={
                      index < 13
                        ? props.player.fromLeft
                        : !props.player.fromLeft
                    }
                  />
                ))}
                {props.cubes[0] && props.cubes[0].rolled && (
                  <>
                    <Cube class="first" cube={props.cubes[0]} />
                    <Cube class="second" cube={props.cubes[1]} />
                  </>
                )}
                <span className="whos-playing">
                  {!props.player.myTurn
                    ? `${props.opponent.name}'s turn`
                    : "Your turn"}
                </span>
                {props.player.myTurn && (
                  <>
                    {(props.cubes[0].playedOnce ||
                      props.cubes[1].playedOnce) && (
                      <Button
                        className="step-back-btn"
                        onClick={() =>
                          props.socketIO.emit("step-back", props._id)
                        }
                        color="primary"
                        variant="contained"
                      >
                        step back
                      </Button>
                    )}
                    {!props.cubes[0].rolled && (
                      <Button
                        className="roll-btn"
                        onClick={() =>
                          props.socketIO.emit("roll-dices", props._id)
                        }
                        color="primary"
                        variant="contained"
                      >
                        roll
                      </Button>
                    )}
                    {props.player.turnEnded && (
                      <Button
                        className="end-btn"
                        onClick={() =>
                          props.socketIO.emit("end-turn", props._id)
                        }
                        color="primary"
                        variant="contained"
                      >
                        End turn
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <div>Winner Winner Chicken dinner</div>
        )}
      </div>
    </DragDropContext>
  );
};

export default BoardMatt;
