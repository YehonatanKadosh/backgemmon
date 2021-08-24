import { useEffect, useState } from "react";
import Piece from "../Piece/Piece";
import "./Column.scss";
import { Droppable } from "react-beautiful-dnd";

const Column = (props) => {
  const [pieces, setPieces] = useState([]);
  const getPosition = () => {
    return props.class === "top"
      ? props.fromLeft
        ? props.place === 0
          ? "0%"
          : props.place < 7
          ? `calc(7.5% + (37.5% / 6 * ${props.place - 1}))`
          : `calc(53.7% + (37.5% / 6 * ${props.place % 7}))`
        : props.place === 0
        ? "93.5%"
        : props.place < 7
        ? `calc(53.7% + (37.5% / 6 * ${6 - props.place}))`
        : `calc(7.5% + (37.5% / 6 * ${5 - (props.place % 7)}))`
      : props.fromLeft //props.class === "bottom"
      ? props.place === 12
        ? "93.5%"
        : props.place < 6
        ? ` calc(7.4%  + (37.5% / 6 * ${props.place}))`
        : `calc(53.7% + (37.5% / 6 * ${props.place % 6}))`
      : props.place === 12
      ? "0"
      : props.place < 6
      ? `calc(53.7% + (37.5% / 6 * ${5 - props.place}))`
      : `calc(7.4% + (37.5% / 6 * ${5 - (props.place % 6)}))`;
  };

  useEffect(() => {
    let pieces = [];
    for (let index = 0; index < props.columnItem?.amount; index++) {
      pieces.push({
        key: index,
        isBlack: props.columnItem?.isBlack,
      });
    }
    setPieces(pieces);
  }, [props, setPieces]);

  return (
    <Droppable
      isDropDisabled={props.player.allPiecesAtHome}
      droppableId={`${props.id}`}
      type="Piece"
    >
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={{ left: getPosition() }}
          className={
            props.class +
            " Column " +
            (props.player?.isBlack === props.columnItem?.isBlack &&
            props.player?.myTurn
              ? "promit"
              : "")
          }
        >
          {pieces.map((piece) => (
            <Piece
              myTurn={props.player?.myTurn}
              columId={props.id}
              key={piece.key}
              chatVisable={props.chatVisable}
              piece={piece}
              player={props.player}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default Column;
