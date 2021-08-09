const auth = require("../middleware/auth");
const express = require("express");
const {
  saveNewUser,
  emailExists,
  logIn,
} = require("../services/mongoDB/Database/userDB");
const { userJoiScema } = require("../services/mongoDB/models/userSchema");
const router = express.Router();
const _ = require("lodash");

router.post("/add", async (req, res) => {
  try {
    await userJoiScema.validateAsync(
      _.pick(req.body, ["name", "email", "password"])
    );
    let user = (await emailExists(req.body.email))[0];
    if (!user) {
      const Token = await saveNewUser(
        _.pick(req.body, ["name", "email", "password"])
      );
      user = (await emailExists(req.body.email))[0];
      res.header("x-access-token", Token).send(_.pick(user, ["_id", "name"]));
    } else res.status(400).send("email already exists");
  } catch (err) {
    res.status(400).send(err.details[0].message);
  }
});

router.post("/logIn", async (req, res) => {
  if (req.body.email && req.body.password) {
    const user = (await emailExists(req.body.email))[0];
    if (user) {
      let loginToken = await logIn(user, req.body.password);
      loginToken
        ? res
            .header("x-access-token", loginToken)
            .send(_.pick(user, ["_id", "name"]))
        : res.status(400).send("wrong password");
    } else res.status(400).send("email not found");
  } else res.status(400).send("email and password required");
});

router.get("/auth", auth, async (req, res) => {
  if (req.user) res.send(_.pick(req.user, ["_id", "name"]));
});

module.exports = router;
