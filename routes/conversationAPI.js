const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const {
  getConversation,
} = require("../services/mongoDB/Database/conversationDB");

// GET /conversations
router.get("/", auth, async (req, res) => {
  if (req.query.participants && Array.isArray(req.query.participants))
    try {
      let conversation = await getConversation(req.query.participants);
      res.json(conversation);
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  else res.status(400).send("participants must a provided array");
});

module.exports = router;
