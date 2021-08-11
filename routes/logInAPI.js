const express = require("express");
const router = express.Router();
const { findUser } = require("../services/mongoDB/Database/userDB");
const _ = require("lodash");
const { createJsonWebToken } = require("../services/JWT");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  if (req.body.email && req.body.password) {
    user = await findUser(req.body.email);
    if (user) {
      if (await bcrypt.compare(req.body.password, user.password)) {
        res
          .header("x-access-token", await createJsonWebToken(user))
          .send(_.pick(user, ["_id", "name"]));
      } else res.status(400).send("wrong password");
    } else res.status(400).send("email not found");
  } else res.status(400).send("email and password required");
});

module.exports = router;
