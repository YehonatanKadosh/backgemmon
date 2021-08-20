import {
  DialogTitle,
  Dialog,
  List,
  ListItem,
  CircularProgress,
} from "@material-ui/core";
import { useState } from "react";
import EventEmitter from "reactjs-eventemitter";
import "./ChooseOpponent.css";

const ChooseOpponent = (props) => {
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [gameDenied, setGameDenied] = useState("");
  const [destinationSocketId, setDestinationSocketId] = useState(undefined);

  const handleClose = () => {
    if (waitingForAnswer)
      props.socketIO.emit("cancel-new-game", destinationSocketId);
    EventEmitter.dispatch("cancle-opponent-choosing");
  };

  const handleListItemClick = (destsocketId) => {
    setWaitingForAnswer(true);
    props.socketIO.on("new-game-denied", (message) => {
      setGameDenied(message);
      setWaitingForAnswer(false);
    });
    props.socketIO.emit("new-game", [props.user._id, destsocketId]);
    setDestinationSocketId(destsocketId);
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={props.choosingOpponent}
    >
      <DialogTitle id="simple-dialog-title">Choose your opponent</DialogTitle>
      <div className="game-denied">{gameDenied}</div>
      {!waitingForAnswer ? (
        <List>
          {props.sockets.map(
            (socket) =>
              socket.userId !== props.user._id &&
              !socket.onGame && (
                <ListItem
                  button
                  key={socket._id}
                  onClick={() => handleListItemClick(socket.userId)}
                >
                  {socket.name}
                </ListItem>
              )
          )}
        </List>
      ) : (
        <CircularProgress />
      )}
    </Dialog>
  );
};

export default ChooseOpponent;
