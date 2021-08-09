import React from "react";
import Chat from "@material-ui/icons/Chat";
import "./ChatToggler.css";
import EventEmitter from "reactjs-eventemitter";
import { Button } from "@material-ui/core";

const ChatToggler = (props) => {
  return (
    <span
      className={
        (props.chatVisable ? "chat_toggler_opened" : "") + " chat_toggler"
      }
    >
      <Button
        variant="contained"
        onClick={() => EventEmitter.dispatch("chat_toggle")}
      >
        <Chat className="chat_icon" />
        {props.chatVisable ? "close chat" : "open chat"}
      </Button>
    </span>
  );
};

export default ChatToggler;
