import React from "react";
import Chat from "@material-ui/icons/Chat";
import "./ChatToggler.css";
import { Button } from "@material-ui/core";
import EventEmitter from "reactjs-eventemitter";

const ChatToggler = (props) => {
  return (
    <Button
      color="primary"
      variant="contained"
      onClick={() => EventEmitter.dispatch("chat_toggle")}
      className="game_switch"
    >
      <Chat className="chat_icon" />
      {props.chatVisable ? "close chat" : "open chat"}
    </Button>
  );
};

export default ChatToggler;
