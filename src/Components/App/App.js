import "./App.scss";
import React, { useEffect, useState } from "react";
import SignIn from "../signIn/signIn";
import { Redirect, Route, Switch } from "react-router";
import SignUp from "../signUp/signUp";
import BackgemmonBoard from "../BackgemmonMain/backgemmonBoard";
import ConnectedElsewhere from "../connectedElsewhere/connectedElsewhere";

const App = () => {
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    return () => sessionStorage.removeItem("token");
  }, []);

  return !isAuthenticated ? (
    <Switch>
      <Route
        path="/"
        exact
        render={(props) => (
          <SignIn
            {...props}
            isAuthenticated={isAuthenticated}
            setUser={setUser}
            userHasAuthenticated={userHasAuthenticated}
          />
        )}
      />
      <Route
        path="/sign-up"
        render={(props) => (
          <SignUp
            {...props}
            isAuthenticated={isAuthenticated}
            setUser={setUser}
            userHasAuthenticated={userHasAuthenticated}
          />
        )}
      />
      <Route
        path="/connectedElsewhere"
        render={(props) => <ConnectedElsewhere {...props} />}
      />
      <Redirect to="/" />
    </Switch>
  ) : (
    <Switch>
      <Route
        path="/Backgemmon"
        render={(props) => (
          <BackgemmonBoard
            {...props}
            user={user}
            userHasAuthenticated={userHasAuthenticated}
          />
        )}
      />
      <Redirect to="/Backgemmon" />
    </Switch>
  );
};

export default App;
