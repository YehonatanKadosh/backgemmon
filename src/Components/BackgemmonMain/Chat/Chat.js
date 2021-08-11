import React from "react";
import MessagesPanel from "./MessagePanel/MessagePanel";
import "./Chat.scss";
import axios from "axios";
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  TextField,
  IconButton,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import EventEmitter from "reactjs-eventemitter";
export class ChatComponent extends React.Component {
  state = {
    sockets: [],
    chosenSocket: undefined,
    expanded: "",
    searchWord: undefined,
  };

  sortSockets = () => {
    let sockets = this.state.sockets;
    let SearchResults = 0;
    for (let i = 0; i < sockets.length; i++) {
      if (this.state.sockets[i].userId === this.props.user._id) {
        [sockets[0], sockets[i]] = [sockets[i], sockets[0]];
      } else if (
        this.state.sockets[i].userId === this.state.chosenSocket?.userId
      )
        [sockets[i], sockets[1]] = [sockets[1], sockets[i]];
      else if (
        this.state.searchWord !== "" &&
        this.state.sockets[i].name
          .toLowerCase()
          .includes(this.state.searchWord?.toLowerCase())
      ) {
        [sockets[i], sockets[SearchResults + 1]] = [
          sockets[SearchResults + 1],
          sockets[i],
        ];
        SearchResults++;
      }
    }
    this.setState({ sockets });
  };

  loadSockets = async () => {
    let responseData = (
      await axios.get(process.env.REACT_APP_SERVER_Sockets, {
        headers: { "x-access-token": sessionStorage.getItem("token") },
      })
    ).data;
    let sockets = this.state.sockets;
    if (sockets) {
      responseData.sockets.forEach((existingSocket) => {
        existingSocket.messagesSet = false;
        sockets.push(existingSocket);
      });
    } else {
      sockets = responseData.sockets.map(
        (existingSocket) => (existingSocket.messagesSet = false)
      );
    }
    this.setState({ sockets }, this.sortSockets);
  };

  setSocketConversationId = async (socket) => {
    let conversation = (
      await axios.get(process.env.REACT_APP_SERVER_Conversations, {
        headers: { "x-access-token": sessionStorage.getItem("token") },
        params: { participants: [this.props.user._id, socket.userId] },
      })
    ).data;
    socket.conversationId = conversation.conversationId;
    if (conversation.messages) socket.messages = conversation.messages;
    socket.messagesSet = true;
  };

  handleSocketSelect = async (socketUserId) => {
    if (this.state.chosenSocket?.userId !== socketUserId) {
      const chosenSocket = this.state.sockets.find(
        (socket) => socket.userId === socketUserId
      );
      if (!chosenSocket.messagesSet)
        await this.setSocketConversationId(chosenSocket);
      if (chosenSocket.newMessages) chosenSocket.newMessages = undefined;
      this.setState({ chosenSocket });
    } else {
      this.setState({ chosenSocket: undefined });
    }

    let sockets = this.state.sockets;
    this.setState({ sockets }, this.sortSockets);
  };

  subscribeToSocketEvents = () => {
    this.props.socket.on("new-connection", (newSocket) => {
      newSocket.messagesSet = false;
      let sockets = this.state.sockets;
      if (sockets) sockets.push(newSocket);
      else sockets = [newSocket];
      this.setState({ sockets }, this.sortSockets);
    });

    this.props.socket.on("user-disconnected", (removedSocketId) => {
      let sockets = this.state.sockets;
      let indexOfSocket = sockets.indexOf(
        sockets.find((c) => c.id === removedSocketId)
      );
      sockets.splice(indexOfSocket, 1);
      this.setState({ sockets });
    });

    this.props.socket.on("message", (message) => {
      let sockets = this.state.sockets;

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
            socket.newMessages === undefined
              ? (socket.newMessages = 1)
              : (socket.newMessages += 1);
          }
        }
      });
      this.setState({ sockets });
    });
  };

  componentDidMount() {
    this.loadSockets();
    this.subscribeToSocketEvents();
  }

  render() {
    return (
      <>
        <div
          className={
            (this.props.chatVisable ? "chat_open" : "") +
            " participants_container"
          }
        >
          {this.state.sockets.map((socket) => {
            return socket.userId !== this.props.user._id ? (
              <Accordion
                key={socket._id}
                expanded={this.state.expanded === socket.userId}
                onChange={(e, isExpanded) =>
                  this.setState({
                    expanded: isExpanded ? socket.userId : false,
                  })
                }
              >
                <div className="card">
                  <AccordionSummary
                    onClick={() => this.handleSocketSelect(socket.userId)}
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography>
                      {socket.name}
                      {socket.newMessages ? `(${socket.newMessages})` : ""}
                    </Typography>
                  </AccordionSummary>
                  {socket.messagesSet && this.state.expanded === socket.userId && (
                    <AccordionDetails>
                      <MessagesPanel
                        me={this.props.user}
                        socketIO={this.props.socket}
                        socket={this.state.chosenSocket}
                      />
                    </AccordionDetails>
                  )}
                </div>
              </Accordion>
            ) : (
              <Accordion key={0} expanded={false}>
                <AccordionSummary
                  expandIcon={
                    <IconButton
                      color="primary"
                      children={<ChevronLeftIcon />}
                      onClick={() => EventEmitter.dispatch("chat_toggle")}
                    />
                  }
                >
                  <Typography>
                    <TextField
                      onChange={(e) =>
                        this.setState(
                          {
                            expanded: undefined,
                            searchWord: e.target.value,
                            chosenSocket: undefined,
                          },
                          this.sortSockets
                        )
                      }
                      label={"Welcome " + this.props.user.name}
                    />
                  </Typography>
                </AccordionSummary>
              </Accordion>
            );
          })}
        </div>
      </>
    );
  }
}
