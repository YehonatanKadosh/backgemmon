import React from "react";
import { ChatComponent } from "./Chat/Chat";
import ChatToggler from "./ChatToggler/ChatToggler";
import socketIOClient from "socket.io-client";
import EventEmitter from "reactjs-eventemitter";
import "./backgemmonBoard.css";
export default class BackgemmonBoard extends React.Component {
  state = {
    chatVisable: true,
    socket: socketIOClient(process.env.REACT_APP_SERVER_URL, {
      query: `name=${this.props.user.name}&userId=${this.props.user._id}`,
    }),
  };

  subscribeToSocketEvents = () => {
    this.state.socket.on("connected-on-another-device", () => {
      this.componentWillUnmount();
      this.props.history.push("/ConnectedElseware");
    });
  };

  subscribeToEventEmitterEvents = () => {
    EventEmitter.subscribe("chat_toggle", () =>
      this.setState({
        chatVisable: !this.state.chatVisable,
      })
    );
  };

  componentDidMount() {
    this.subscribeToSocketEvents();
    this.subscribeToEventEmitterEvents();
  }

  componentWillUnmount() {
    this.state.socket.disconnect();
    sessionStorage.removeItem("token");
    this.props.userHasAuthenticated(false);
  }

  render() {
    return (
      <div className="backgemmon_container">
        <ChatComponent
          socket={this.state.socket}
          chatVisable={this.state.chatVisable}
          user={this.props.user}
        />
        <ChatToggler chatVisable={this.state.chatVisable} />
      </div>
    );
  }
}
