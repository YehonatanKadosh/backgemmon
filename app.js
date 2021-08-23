const express = require("express");
const cors = require("cors");
const user = require("./routes/userAPI");
const socket = require("./routes/socketAPI");
const conversation = require("./routes/conversationAPI");
const notFound = require("./routes/404API");
const logIn = require("./routes/logInAPI");
const app = express();
app.use(cors({ exposedHeaders: "x-access-token" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", async (req, res, next) => {
  let mongo = require("mongoose");
  const { userSchema } = require("./services/mongoDB/models/userSchema");
  let User = mongo.model("User", userSchema);
  res.json(await User.find({}));
});
app.use("/users", user);
app.use("/conversations", conversation);
app.use("/logIn", logIn);
app.use("/sockets", socket);
app.use("/**", notFound);

module.exports = app;
