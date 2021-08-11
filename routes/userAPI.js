const express = require("express");
const {
  saveNewUser,
  findUser,
} = require("../services/mongoDB/Database/userDB");
const { userJoiScema } = require("../services/mongoDB/models/userSchema");
const router = express.Router();
const _ = require("lodash");
const { createJsonWebToken } = require("../services/JWT");

router.post("/add", async (req, res) => {
  try {
    await userJoiScema.validateAsync(
      _.pick(req.body, ["name", "email", "password"])
    );

    let user = await findUser(req.body.email);
    if (user === undefined) {
      user = await saveNewUser(_.pick(req.body, ["name", "email", "password"]));
      res
        .header("x-access-token", await createJsonWebToken(user))
        .send(_.pick(user, ["_id", "name"]));
    } else res.status(400).send("user already exists");
  } catch (err) {
    res.status(400).send(err.details.message);
  }
});

module.exports = router;
