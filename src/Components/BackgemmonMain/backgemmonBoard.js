import React from "react";
import { ChatComponent } from "./Chat/Chat";
import socketIOClient from "socket.io-client";
import EventEmitter from "reactjs-eventemitter";
import "./backgemmonBoard.css";
import axios from "axios";
import { Board } from "./Board/Board";
import BackToGameRequest from "./BackToGameRequest/BackToGameRequest";
export default class BackgemmonBoard extends React.Component {
  state = {
    sockets: [],
    chatVisable: true,
    socket: socketIOClient(process.env.REACT_APP_SERVER_URL, {
      extraHeaders: {
        "x-auth-token": sessionStorage.getItem("token"),
      },
      transportOptions: {
        polling: {
          extraHeaders: {
            "x-auth-token": sessionStorage.getItem("token"),
          },
        },
      },
    }),
    backToGameRequest: undefined,
  };

  sortSockets = () => {
    let sockets = this.state.sockets;
    let SearchResults = 0;
    for (let i = 0; i < this.state.sockets.length; i++) {
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

  subscribeToSocketEvents = () => {
    this.state.socket.on("connected-on-another-device", () => {
      this.props.history.push("/connectedElsewhere");
      if (this.state.socket.connected) this.state.socket.disconnect();
      sessionStorage.removeItem("token");
      this.props.userHasAuthenticated(false);
    });

    this.state.socket.on("new-connection", (newSocket) => {
      newSocket.messagesSet = false;
      let sockets = this.state.sockets;
      if (sockets) sockets.push(newSocket);
      else sockets = [newSocket];
      this.setState({ sockets }, this.sortSockets);
    });

    this.state.socket.on("user-disconnected", (removedSocketId) => {
      let sockets = this.state.sockets;
      let indexOfSocket = sockets.indexOf(
        sockets.find((s) => s.userId === removedSocketId)
      );
      sockets.splice(indexOfSocket, 1);
      this.setState({ sockets });
      EventEmitter.dispatch("user-disconnected", removedSocketId);
    });

    this.state.socket.on("new-game-started", (opponents) => {
      let sockets = this.state.sockets;
      opponents.forEach((opponent) => {
        let opponentSocket;
        opponentSocket = sockets.find(
          (socket) => socket.userId === opponent.userId
        );

        if (opponentSocket) opponentSocket.onGame = true;
      });
      this.setState({ sockets });
    });

    this.state.socket.on("game-ended", (opponents) => {
      let sockets = this.state.sockets;

      opponents.forEach((opponent) => {
        let opponentSocket;
        opponentSocket = sockets.find(
          (socket) => socket.userId === opponent.userId
        );

        if (opponentSocket) opponentSocket.onGame = false;
      });

      if (
        opponents.find((opponent) =>
          this.props.user.id === opponent.userId
            ? opponent.userId
            : opponent._id
        )
      ) {
        this.setState({
          sockets,
          backToGameRequest: undefined,
        });
        EventEmitter.dispatch("game-ended", opponents);
      } else this.setState({ sockets });
    });

    this.state.socket.on("request-back-to-game", (opponent) => {
      this.setState({ backToGameRequest: { opponent, isFirst: true } });
    });

    this.state.socket.on("request-back-to-game-approved-once", (opponent) => {
      this.setState({ backToGameRequest: { opponent, isFirst: false } });
    });
  };

  subscribeToEventEmitterEvents = () => {
    EventEmitter.subscribe("chat_toggle", () =>
      this.setState({
        chatVisable: !this.state.chatVisable,
      })
    );

    EventEmitter.subscribe("back-to-game-request-ended", () => {
      this.setState({ backToGameRequest: undefined });
    });
  };

  loadSockets = async () => {
    let responseData = (
      await axios.get(process.env.REACT_APP_SERVER_URL + "/sockets", {
        headers: { "x-access-token": sessionStorage.getItem("token") },
      })
    ).data;
    let sockets = this.state.sockets;
    let index = 0;
    if (sockets) {
      responseData.sockets.forEach((existingSocket) => {
        existingSocket.messagesSet = false;
        sockets.push(existingSocket);
        index += 1;
        if (index === responseData.sockets.length)
          this.setState({ sockets }, this.sortSockets);
      });
    } else {
      sockets = responseData.sockets.map((existingSocket) => {
        existingSocket.messagesSet = false;
        index += 1;
        if (index === responseData.sockets.length)
          this.setState({ sockets }, this.sortSockets);
        return existingSocket;
      });
    }
  };

  componentDidMount() {
    this.loadSockets();
    this.subscribeToSocketEvents();
    this.subscribeToEventEmitterEvents();
  }

  render() {
    return (
      <div className="backgemmon_container">
        {this.state.chatVisable && (
          <ChatComponent
            sortSockets={this.sortSockets}
            sockets={this.state.sockets}
            socketIO={this.state.socket}
            user={this.props.user}
          />
        )}
        <Board
          chatVisable={this.state.chatVisable}
          sockets={this.state.sockets}
          user={this.props.user}
          socketIO={this.state.socket}
        />
        {this.state.backToGameRequest && (
          <BackToGameRequest
            socketIO={this.state.socket}
            request={this.state.backToGameRequest}
            user={this.props.user}
          />
        )}
      </div>
    );
  }
}
