import { AccordionSummary, Typography } from "@material-ui/core";
import EventEmitter from "reactjs-eventemitter";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { GamesOutlined } from "@material-ui/icons";

const ChatHead = (props) => {
  return (
    <AccordionSummary
      onClick={() =>
        EventEmitter.dispatch("socket_selected", props.socket.userId)
      }
      expandIcon={props.socket.onGame ? <GamesOutlined /> : <ExpandMoreIcon />}
    >
      <Typography>
        {props.socket.name}
        {props.socket.newMessages ? ` (${props.socket.newMessages})` : ""}
      </Typography>
    </AccordionSummary>
  );
};

export default ChatHead;
