const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const {
  getAllConnectedSockets,
} = require("../services/mongoDB/Database/socketDB");

// GET /sockets
router.get("/", auth, (req, res) => {
  getAllConnectedSockets().then((sockets) => {
    res.json({ sockets });
  });
});

module.exports = router;
