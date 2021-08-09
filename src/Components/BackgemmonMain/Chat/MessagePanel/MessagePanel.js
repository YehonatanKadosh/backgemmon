import { Button, TextField } from "@material-ui/core";
import React, { useState } from "react";
import "./MessagePanel.css";
import EventEmitter from "reactjs-eventemitter";

const MessagesPanel = (props) => {
  const [input_value, setInputValue] = useState("");
  let list = props.channel.messages ? (
    props.channel.messages.map((message) => (
      <div key={message._id}>{message.text}</div>
    ))
  ) : (
    <div className="no-content-mesage">There is no messages to show</div>
  );

  const send = () => {
    if (input_value !== "") {
      EventEmitter.dispatch("send-message", input_value);
      setInputValue("");
    }
  };

  return (
    <>
      {list}
      <TextField
        margin="normal"
        className="w-100"
        onChange={(e) => setInputValue(e.target.value)}
        autoFocus
        value={input_value}
        InputProps={{
          endAdornment: (
            <Button onClick={() => send()} color="primary">
              Send
            </Button>
          ),
        }}
      />
    </>
  );
};

export default MessagesPanel;
