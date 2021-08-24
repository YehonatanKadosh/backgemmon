const express = require("express");
const {
  saveNewUser,
  findUser,
} = require("../services/mongoDB/Database/userDB");
const { userJoiScema } = require("../services/mongoDB/models/userSchema");
const router = express.Router();
const _ = require("lodash");
const { createJsonWebToken } = require("../services/JsonWebToken/JWT");

// POST /users/add
router.post("/add", async (req, res) => {
  try {
    await userJoiScema.validateAsync(
      _.pick(req.body, ["name", "email", "password"])
    );

    try {
      await findUser(req.body.email);
      res.status(400).send("user already exists");
    } catch {
      user = await saveNewUser(_.pick(req.body, ["name", "email", "password"]));
      res
        .header("x-access-token", await createJsonWebToken(user))
        .send(_.pick(user, ["_id", "name", "game"]));
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
