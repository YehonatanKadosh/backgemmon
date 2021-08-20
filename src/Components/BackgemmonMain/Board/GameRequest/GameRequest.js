import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Slide,
} from "@material-ui/core";
import { forwardRef, useEffect, useState } from "react";
import EventEmitter from "reactjs-eventemitter";

const GameRequest = (props) => {
  const [answered, setAnswered] = useState(false);
  const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  useEffect(() => {
    props.socketIO.on("cancel-request", () => {
      EventEmitter.dispatch("request-ended");
    });
  }, [props.socketIO]);

  const handleClose = () => {
    if (!answered)
      props.socketIO.emit("new-game-denied", {
        message: `${props.user.name} did'nt respond`,
        requester: props.requester.userId,
      });
    EventEmitter.dispatch("request-ended");
  };

  const handleAgree = () => {
    props.socketIO.emit("new-game-promited", props.requester.userId);
    setAnswered(true);
    EventEmitter.dispatch("request-ended");
  };

  const handleDisagree = () => {
    props.socketIO.emit("new-game-denied", {
      message: `${props.user.name} denied your request`,
      requester: props.requester.userId,
    });
    setAnswered(true);
    EventEmitter.dispatch("request-ended");
  };

  return (
    <Dialog
      open={true}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
    >
      <DialogTitle>{props.requester.name} wants to play with you</DialogTitle>
      <DialogActions>
        <Button onClick={handleDisagree} color="primary">
          Disagree
        </Button>
        <Button onClick={handleAgree} color="primary">
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameRequest;
