const config = require("config");
const express = require("express");
const auth = require("../middleware/auth");
const {
  getAllConnectedChannels,
} = require("../services/mongoDB/Database/channelsDB");
const { newMessage } = require("../services/mongoDB/Database/messagesDB");
const { getAllChannels } = require("../services/mongoDB/Database/userDB");
const router = express.Router();

router.post("/messages", (req, res) => {
  if (req.body.sender && req.body.message && req.body.destination) {
    newMessage(req.body.sender, req.body.message, req.body.destination);
    res.end();
  } else
    res.status(400).send("sender / message / destinationUser NOT PROVIDED");
});

router.get("/getOnlineChannels", auth, (req, res) => {
  getAllConnectedChannels().then((ressult) => {
    res.json({
      channels: ressult,
    });
  });
});

module.exports = router;
