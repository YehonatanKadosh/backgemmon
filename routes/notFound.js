var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
  res.status(404).send("404 NotFound");
});

module.exports = router;
