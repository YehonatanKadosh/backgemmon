import React from "react";
import ChannelList from "./ChannelList";
import "./chat.scss";

const Chat = () => {
  let channels = [{ id: 1, name: "first", participants: 10 }];
  return (
    <>
      <div className="chat-app">
        ‍ <ChannelList channels={channels} />
      </div>
    </>
  );
};

export default Chat;
