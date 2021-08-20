import { AccordionSummary, TextField } from "@material-ui/core";
import EventEmitter from "reactjs-eventemitter";
import "./ChatUserHeader.css";

const ChatUserHeader = (props) => {
  return (
    <AccordionSummary className="user-accordion">
      <TextField
        onChange={(e) =>
          EventEmitter.dispatch("search_changed", e.target.value)
        }
        label={"Welcome " + props.name}
        helperText="search user"
      />
    </AccordionSummary>
  );
};
export default ChatUserHeader;
