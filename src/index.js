import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./Components/App/App";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter } from "react-router-dom";
import { createTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/core";
import { brown } from "@material-ui/core/colors";
const theme = createTheme({
  palette: {
    primary: brown,
  },
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>,
  document.getElementById("root")
);
