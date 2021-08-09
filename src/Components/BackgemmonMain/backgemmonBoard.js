import { ChatComponent } from "./Chat/Chat";

const BackgemmonBoard = (props) => {
  return <ChatComponent user={props.user} history={props.history} />;
};

export default BackgemmonBoard;
