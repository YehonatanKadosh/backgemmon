import React from "react";
import "./Chat.scss";
import axios from "axios";
import { Accordion, CircularProgress } from "@material-ui/core";
import EventEmitter from "reactjs-eventemitter";
import ChatHead from "./ChatComponents/ChatHead/ChatHead";
import ChatBody from "./ChatComponents/ChatBody/ChatBody";
import ChatUserHeader from "./ChatComponents/ChatUserHeader/ChatUserHeader";

export class ChatComponent extends React.Component {
  state = {
    chosenSocket: undefined,
    searchWord: undefined,
    loading: false,
  };

  setSocketConversationId = async (socket) => {
    this.setState({ loading: true });
    let conversation = (
      await axios.get(process.env.REACT_APP_SERVER_URL + "/conversations", {
        headers: { "x-access-token": sessionStorage.getItem("token") },
        params: { participants: [this.props.user._id, socket.userId] },
      })
    ).data;
    socket.conversationId = conversation.conversationId;
    if (conversation.messages) socket.messages = conversation.messages;
    socket.messagesSet = true;
    this.setState({ loading: false });
  };

  subscribeToSocketEvents = () => {
    this.props.socketIO.on("message", (message) => {
      let sockets = this.props.sockets;
      let index = 0;
      sockets.forEach(async (socket) => {
        if (
          (socket.userId === message.receiverId &&
            message.senderId === this.props.user._id) ||
          (socket.userId === message.senderId &&
            message.receiverId === this.props.user._id)
        ) {
          if (!socket.messagesSet) await this.setSocketConversationId(socket);
          else {
            !socket.messages
              ? (socket.messages = [message])
              : socket.messages.push(message);
          }
          if (
            message.receiverId === this.props.user._id &&
            this.state.chosenSocket?.userId !== socket.userId
          ) {
            !socket.newMessages
              ? (socket.newMessages = 1)
              : (socket.newMessages += 1);
          }
        }
        index += 1;
        if (index === this.props.sockets.length) {
          this.setState({ sockets });
        }
      });
    });
  };

  subscribeToEventEmmiterEvents = () => {
    EventEmitter.subscribe("socket_selected", async (socketUserId) => {
      if (
        !this.state.chosenSocket ||
        this.state.chosenSocket?.userId !== socketUserId
      ) {
        const chosenSocket = this.props.sockets.find(
          (socket) => socket.userId === socketUserId
        );
        if (!chosenSocket?.messagesSet)
          await this.setSocketConversationId(chosenSocket);
        if (chosenSocket.newMessages) chosenSocket.newMessages = undefined;
        this.setState({ chosenSocket });
      } else {
        this.setState({ chosenSocket: undefined });
      }

      let sockets = this.props.sockets;
      this.setState({ sockets }, this.props.sortSockets);
    });

    EventEmitter.subscribe("search_changed", (newSearchWord) =>
      this.setState(
        {
          searchWord: newSearchWord,
          chosenSocket: undefined,
        },
        this.sortSockets
      )
    );
  };

  componentDidMount() {
    this.subscribeToSocketEvents();
    this.subscribeToEventEmmiterEvents();
  }

  render() {
    return (
      <>
        <div className="participants_container">
          {this.props.sockets.map((socket) =>
            socket.userId !== this.props.user._id ? (
              <Accordion
                key={socket._id}
                expanded={this.state.chosenSocket?.userId === socket.userId}
                onChange={() =>
                  EventEmitter.dispatch("socket_selected", socket.userId)
                }
              >
                <ChatHead socket={socket} />
                <ChatBody
                  socket={socket}
                  user={this.props.user}
                  socketIO={this.props.socketIO}
                />
              </Accordion>
            ) : (
              <React.Fragment key={"0"}>
                <Accordion expanded={false} color="primary">
                  <ChatUserHeader name={this.props.user.name} />
                </Accordion>
                {this.state.loading && <CircularProgress />}
              </React.Fragment>
            )
          )}
        </div>
      </>
    );
  }
}
