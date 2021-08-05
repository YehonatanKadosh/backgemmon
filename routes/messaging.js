const express = require("express");
const { newMessage } = require("../mongoDB/messagesDB");
const router = express.Router();

router.post("/messages", (req, res) => {
  if (req.body.sender && req.body.message && req.body.destination) {
    newMessage(req.body.sender, req.body.message, req.body.destination);
    res.end();
  } else
    res.status(400).send("sender / message / destinationUser NOT PROVIDED");
});

module.exports = router;
