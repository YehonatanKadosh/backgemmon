import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { NavLink } from "react-router-dom";
import { Copyright, useStyles } from "../copyright/copyright";
import axios from "axios";

export default function SignIn(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const classes = useStyles();

  const submit = () => {
    axios
      .post(process.env.REACT_APP_SERVER_URL + "/logIn", {
        email,
        password,
      })
      .then((response) => {
        sessionStorage.setItem("token", response.headers["x-access-token"]);
        props.userHasAuthenticated(true);
        props.setUser(response.data);
        props.history.push("/Backgemmon");
      })
      .catch((err) => {
        setError(err.response?.data.toString());
      });
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          error={error?.toLowerCase().includes("email")}
          helperText={error?.toLowerCase().includes("email") ? error : ""}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
        <TextField
          color="primary"
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
          error={error?.toLowerCase().includes("password")}
          helperText={error?.toLowerCase().includes("password") ? error : ""}
          autoComplete="current-password"
        />
        <Button
          onClick={() => submit()}
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
        >
          Sign In
        </Button>
        <Grid container>
          <Grid item>
            <NavLink to="/sign-up">Don't have an account? Sign Up</NavLink>
          </Grid>
        </Grid>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}
