import { AlbumTwoTone } from "@material-ui/icons";
import { useCallback, useEffect, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import EventEmitter from "reactjs-eventemitter";
import "./Piece.scss";
const Piece = (props) => {
  const getWidth = useCallback(() => {
    return props.chatVisable
      ? 0.75 * window.innerWidth > 411
        ? 411
        : 0.75 * window.innerWidth
      : window.innerWidth > 411
      ? 411
      : window.innerWidth;
  }, [props.chatVisable]);

  const [width, setWidth] = useState(getWidth());
  useEffect(() => {
    window.addEventListener("resize", () => setWidth(getWidth()));
  }, [getWidth]);

  return (
    <Draggable
      draggableId={`${props.columId},${props.piece.key}`}
      index={props.piece.key}
      isDragDisabled={
        props.player?.isBlack !== props.piece.isBlack ||
        !props.player?.myTurn ||
        (props.player.jailPopulated && props.columId !== 0)
      }
    >
      {(provided) => (
        <span
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="d-flex"
          style={{ height: width * 0.065 }}
          onClick={() => {
            if (
              !(
                props.player?.isBlack !== props.piece.isBlack ||
                !props.player?.myTurn ||
                (props.player.jailPopulated && props.columId !== 0)
              )
            )
              EventEmitter.dispatch("piece-clicked", props.columId);
          }}
        >
          <AlbumTwoTone
            style={{
              fontSize: width * 0.07,
            }}
            className={
              (props.piece.isBlack ? "black" : "white") +
              " game-piece " +
              (props.columId === 0 ? "jail-pieces" : "")
            }
          />
        </span>
      )}
    </Draggable>
  );
};
export default Piece;
