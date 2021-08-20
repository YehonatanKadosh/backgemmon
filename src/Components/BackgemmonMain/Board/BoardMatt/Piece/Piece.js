import { AlbumTwoTone } from "@material-ui/icons";
import { useCallback, useEffect, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import "./Piece.scss";
const Piece = (props) => {
  const getWidth = useCallback(() => {
    return props.chatVisable
      ? 0.75 * window.innerWidth > 646
        ? 646
        : 0.75 * window.innerWidth
      : window.innerWidth > 646
      ? 646
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
        (props.jailPopulated === true && props.columId !== 0)
      }
    >
      {(provided) => (
        <span
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <AlbumTwoTone
            style={{
              fontSize: width * 0.07,
            }}
            className={
              (props.piece.isBlack ? "black" : "white") + " game-piece"
            }
          />
        </span>
      )}
    </Draggable>
  );
};
export default Piece;
