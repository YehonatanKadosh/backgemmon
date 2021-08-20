import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  Slide,
} from "@material-ui/core";
import { forwardRef, useState } from "react";
import EventEmitter from "reactjs-eventemitter";

const BackToGameRequest = (props) => {
  const [panding, setPanding] = useState(false);
  const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  const handleClose = () => {
    props.socketIO.emit("end-game", [props.request.opponent, props.user]);
    EventEmitter.dispatch("back-to-game-request-ended");
  };

  const handleAgree = () => {
    props.request.isFirst
      ? props.socketIO.emit("request-back-to-game-approved")
      : props.socketIO.emit("back-to-game");
    setPanding(true);
  };

  return (
    <Dialog
      open={props.request.opponent ? true : false}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
    >
      <DialogTitle>
        {props.request.opponent.name} is online, get back to game?
      </DialogTitle>
      {!panding ? (
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Disagree
          </Button>
          <Button onClick={handleAgree} color="primary">
            Agree
          </Button>
        </DialogActions>
      ) : (
        <>
          <div>waiting for {props.request.opponent.name} to connect</div>
          <CircularProgress />
        </>
      )}
    </Dialog>
  );
};

export default BackToGameRequest;
