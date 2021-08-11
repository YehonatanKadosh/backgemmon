const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const {
  getConversation,
} = require("../services/mongoDB/Database/conversationDB");

router.get("/", auth, (req, res) => {
  if (req.query.participants)
    if (req.query.participants.length > 1) {
      getConversation(req.query.participants).then((conversation) =>
        res.json(conversation)
      );
    } else res.status(400).send("participants must be plural");
  else res.status(400).send("participants must be provided");
});

module.exports = router;
