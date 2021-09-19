import { Button } from "@material-ui/core";
import React from "react";

const ConnectedElsewhere = (props) => {
  return (
    <div className="d-flex flex-column">
      <b>looks like youre already connected on another device</b>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          props.history.push("/");
        }}
      >
        Back to login
      </Button>
    </div>
  );
};

export default ConnectedElsewhere;
