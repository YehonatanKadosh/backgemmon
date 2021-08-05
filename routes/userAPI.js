const express = require("express");
const { saveNewUser, usernameExists, logIn } = require("../mongoDB/userDB");
const router = express.Router();

router.post("/new-user", async (req, res) => {
  if (req.body.username && req.body.password && req.body.name) {
    if (await usernameCheck(req.query.username))
      res.send(
        await saveNewUser(req.body.username, req.body.password, req.body.name)
      );
    else res.status(400).send("Username already exists");
  } else res.status(400).send("username / password / name NOT PROVIDED");
});

router.get("/usernameExists", async (req, res) => {
  if (req.query.username) res.send(await usernameExists(req.query.username));
  else res.status(400).send("username NOT PROVIDED");
});

router.post("/logIn", async (req, res) => {
  if (req.body.username && req.body.password) {
    if (await usernameExists(req.body.username))
      res.send(
        (await logIn(req.body.username, req.body.password)) ||
          "Incorrect password"
      );
    else res.status(400).send("Username not found");
  } else res.status(400).send("username / password NOT PROVIDED");
});

module.exports = router;
