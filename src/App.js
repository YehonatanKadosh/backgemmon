import "./App.css";
import React from "react";
import Chat from "./components/Chat/Chat";
// import socketIOClient from "socket.io-client";
// const SERVER = "http://localhost:4001";

const App = () => {
  // const socket = socketIOClient(SERVER);
  return (
    <>
      <Chat />
    </>
  );
};

export default App;
