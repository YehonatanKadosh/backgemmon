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

export default function SignUp(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lastName, setFirst] = useState("");
  const [firstName, setLast] = useState("");
  const [error, setError] = useState({});
  const classes = useStyles();

  const submit = () => {
    axios
      .post(process.env.REACT_APP_SERVER_URL + "/users/add", {
        email,
        password,
        name: firstName + lastName ? ` ${lastName}` : "",
      })
      .then((response) => {
        sessionStorage.setItem("token", response.headers["x-access-token"]);
        props.userHasAuthenticated(true);
        props.setUser(response.data);
        props.history.push("/Backgemmon");
      })
      .catch((err) => {
        setError(
          err.response?.data.details
            ? err.response?.data.details[0]
            : err.response?.data.toString()
        );
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
          Sign up
        </Typography>
        <br />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              autoComplete="fname"
              name="firstName"
              variant="outlined"
              required
              fullWidth
              id="firstName"
              label="First Name"
              autoFocus
              error={error?.path && error.path && error.path[0] === "name"}
              helperText={
                error?.message && error.path && error.path[0] === "name"
                  ? error?.message
                  : ""
              }
              onChange={(e) => setFirst(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="lname"
              onChange={(e) => setLast(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              error={
                (error?.path && error.path && error.path[0] === "email") ||
                error.toString().includes("user")
              }
              helperText={
                (error?.message && error.path && error.path[0] === "email") ||
                error.toString().includes("user")
                  ? error?.message || error
                  : ""
              }
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              error={error?.path && error.path && error.path[0] === "password"}
              helperText={
                error?.message && error.path && error.path[0] === "password"
                  ? error?.message
                  : ""
              }
            />
          </Grid>
        </Grid>
        <Button
          onClick={() => submit()}
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
        >
          Sign Up
        </Button>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <NavLink to="/">Already have an account? Sign in</NavLink>
          </Grid>
        </Grid>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
}
