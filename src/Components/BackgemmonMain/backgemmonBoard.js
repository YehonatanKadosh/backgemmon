import { makeStyles } from "@material-ui/core";
import { useState } from "react";
import { ChatComponent } from "./Chat/Chat";
import ChatToggler from "./ChatToggler/ChatToggler";

const BackgemmonBoard = (props) => {
  const [chatVisable, setChatVisability] = useState(true);

  const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    hide: {
      display: "none",
    },
    drawer: {
      width: "25vw",
      flexShrink: 0,
    },
    drawerPaper: {
      width: "25vw",
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: -"25vw",
    },
    contentShift: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
  }));

  const classes = useStyles();

  return (
    <div className="w-100 h-100">
      <ChatComponent
        classes={classes}
        chatVisable={chatVisable}
        user={props.user}
        history={props.history}
      />
      <ChatToggler
        setChatVisability={setChatVisability}
        chatVisable={chatVisable}
      />
    </div>
  );
};

export default BackgemmonBoard;
