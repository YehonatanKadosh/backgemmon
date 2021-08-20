import { AccordionDetails } from "@material-ui/core";
import MessagesPanel from "./components/MessagePanel/MessagePanel";

const ChatBody = (props) => {
  return (
    props.socket.messagesSet && (
      <AccordionDetails>
        <MessagesPanel
          me={props.user}
          socketIO={props.socketIO}
          socket={props.socket}
        />
      </AccordionDetails>
    )
  );
};

export default ChatBody;
