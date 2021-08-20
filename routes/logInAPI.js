const express = require("express");
const router = express.Router();
const { findUser } = require("../services/mongoDB/Database/userDB");
const _ = require("lodash");
const { createJsonWebToken } = require("../services/JsonWebToken/JWT");
const bcrypt = require("bcrypt");

// POST /logIn
router.post("/", async (req, res) => {
  if (req.body.email && req.body.password) {
    try {
      let user = await findUser(req.body.email);
      if (await bcrypt.compare(req.body.password, user.password)) {
        res
          .header("x-access-token", await createJsonWebToken(user))
          .send(_.pick(user, ["_id", "name", "game"]));
      } else res.status(400).send("wrong password");
    } catch (err) {
      res.status(400).send(err);
    }
  } else res.status(400).send("email and password required");
});

module.exports = router;
