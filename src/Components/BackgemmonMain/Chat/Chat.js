import React from "react";
import MessagesPanel from "./MessagePanel/MessagePanel";
import socketIOClient from "socket.io-client";
import "./Chat.css";
import axios from "axios";
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Drawer,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Face from "@material-ui/icons/Face";
import EventEmitter from "reactjs-eventemitter";

export class ChatComponent extends React.Component {
  state = {
    channels: [],
    chosenChannel: undefined,
  };

  sortChannels = (channels) => {
    channels.sort((c1, c2) =>
      c1.userId === this.props.user._id
        ? -1
        : c2.userId === this.props.user._id
        ? 1
        : 0
    );
  };

  configureSocket = () => {
    const socket = socketIOClient(process.env.REACT_APP_SERVER_URL, {
      query: `name=${this.props.user.name}&userId=${this.props.user._id}`,
    });

    socket.on("connected-on-another-device", () => {
      socket.disconnect();
      this.props.history.push("/ConnectedElseware");
    });

    socket.on("new-connection", (newChannel) => {
      let channels = this.state.channels;
      if (channels) channels.push(newChannel);
      else channels = [newChannel];
      this.sortChannels(channels);
      this.setState({ channels });
    });

    socket.on("user-disconnected", (removedChannelId) => {
      let channels = this.state.channels;
      let indexOfChannel = channels.indexOf(
        channels.find((c) => c.id === removedChannelId)
      );
      channels.splice(indexOfChannel, 1);
      this.setState({ channels });
    });

    socket.on("message", (message) => {
      message.isSent = this.props.user._id === message.senderid ? true : false;
      let channels = this.state.channels;

      channels.forEach((channel) => {
        if (
          (channel.userId === message.senderid &&
            message.destinationUserId === this.props.user._id) ||
          (channel.userId === message.destinationUserId &&
            message.senderid === this.props.user._id)
        ) {
          !channel.messages
            ? (channel.messages = [message])
            : channel.messages.push(message);
          if (
            message.destinationUserId === this.props.user._id &&
            this.state.chosenChannel?.userId !== channel.userId
          )
            !channel.newMessages
              ? (channel.newMessages = 1)
              : (channel.newMessages += 1);
        }
      });
      this.setState({ channels });
    });

    EventEmitter.subscribe("send-message", (text) => {
      socket.emit("send-message", {
        destinationUserId: this.state.chosenChannel.userId,
        text,
        senderid: this.props.user._id,
      });
    });

    EventEmitter.subscribe("disconnect", () => socket.disconnect());
  };

  loadChannels = async () => {
    let responseData = (
      await axios.get(process.env.REACT_APP_SERVER_ONLINE_Channels, {
        headers: { "x-access-token": sessionStorage.getItem("token") },
      })
    ).data;

    let channels = this.state.channels;
    if (channels) {
      responseData.channels.forEach((existingChannel) => {
        channels.push(existingChannel);
      });
    } else channels = responseData.channels;
    this.sortChannels(channels);
    this.setState({ channels });
  };

  handleChannelSelect = (id) => {
    if (this.state.chosenChannel?.userId !== id) {
      const chosenChannel = this.state.channels.find(
        (channel) => channel.userId === id
      );
      if (chosenChannel.newMessages) chosenChannel.newMessages = undefined;
      this.setState({ chosenChannel });
    } else {
      this.setState({ chosenChannel: undefined });
    }
  };

  componentDidMount() {
    this.configureSocket();
    this.loadChannels();
  }

  componentWillUnmount() {
    EventEmitter.dispatch("disconnect");
  }

  render() {
    return (
      <>
        <Drawer
          className={this.props.classes.drawer}
          classes={this.props.classes.drawerPaper}
          anchor={"left"}
          open={this.props.chatVisable}
          variant="persistent"
        >
          {this.props.chatVisable &&
            this.state.channels.map((channel) => {
              return (
                <Accordion
                  expanded={
                    this.state.chosenChannel &&
                    this.state.chosenChannel.userId === channel.userId &&
                    channel.userId !== this.props.user._id
                      ? true
                      : false
                  }
                  key={channel.userId}
                  disabled={channel.userId === this.props.user._id}
                >
                  <AccordionSummary
                    onClick={() => this.handleChannelSelect(channel.userId)}
                    expandIcon={
                      channel.userId !== this.props.user._id ? (
                        <ExpandMoreIcon />
                      ) : (
                        <Face />
                      )
                    }
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                  >
                    <Typography>
                      {channel.name}{" "}
                      {channel.newMessages ? `(${channel.newMessages})` : ""}
                    </Typography>
                  </AccordionSummary>
                  {channel.userId !== this.props.user._id &&
                    this.state.chosenChannel &&
                    this.state.chosenChannel.userId === channel.userId && (
                      <AccordionDetails className="messagesPanel">
                        <MessagesPanel channel={this.state.chosenChannel} />
                      </AccordionDetails>
                    )}
                </Accordion>
              );
            })}
        </Drawer>
      </>
    );
  }
}
