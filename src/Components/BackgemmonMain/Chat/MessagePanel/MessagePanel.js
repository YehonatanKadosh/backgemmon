import { IconButton, TextField } from "@material-ui/core";
import { NearMe } from "@material-ui/icons";
import moment from "moment";
import React, { useEffect, useState } from "react";
import "./MessagePanel.scss";

const MessagesPanel = (props) => {
  const [message, setMessage] = useState("");
  const [messagesEnd, setMessagesEnd] = useState(undefined);

  const send = () => {
    if (message !== "") {
      props.socketIO.emit("send-message", {
        conversationId: props.socket.conversationId,
        message,
        receiverId: props.socket.userId,
        senderId: props.me._id,
        time: new Date(),
      });
      setMessage("");
    }
  };

  useEffect(() => {
    if (messagesEnd) messagesEnd.scrollIntoView({ behavior: "smooth" });
  }, [messagesEnd]);

  return (
    (props.socket && (
      <>
        <div className="card-body msg_card_body">
          {props.socket.messages ? (
            props.socket.messages.map((message) => {
              return (
                <React.Fragment key={message._id}>
                  <div className="msg_cotainer">
                    <div
                      className={
                        (message.senderId === props.me._id
                          ? "sent"
                          : "recieved") + " text_container"
                      }
                    >
                      {message.message}
                      <span
                        className={
                          (message.senderId === props.me._id
                            ? "msg_time_sent"
                            : "msg_time_recieved") + " msg_time"
                        }
                      >
                        {moment().format("l") ===
                        moment(message.time).format("l")
                          ? moment(message.time).fromNow()
                          : moment(message.time).calendar()}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{ float: "left", clear: "both" }}
                    ref={(el) => {
                      setMessagesEnd(el);
                    }}
                  ></div>
                </React.Fragment>
              );
            })
          ) : (
            <div className="no-content-mesage">
              There is no messages to show
            </div>
          )}
        </div>
        <TextField
          className="w-100"
          onChange={(e) => setMessage(e.target.value)}
          autoFocus
          multiline
          value={message}
          InputProps={{
            endAdornment: (
              <IconButton
                color="primary"
                onClick={() => send()}
                children={<NearMe />}
              />
            ),
          }}
        />
      </>
    )) ||
    ""
  );
};

export default MessagesPanel;
