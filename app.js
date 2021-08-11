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
app.use("/users", user);
app.use("/conversations", conversation);
app.use("/logIn", logIn);
app.use("/sockets", socket);
app.use("/**", notFound);

const server = require("http").createServer(app);
// services
require("./services/mongoDB/mongoDB");
require("./services/socketIo").Init(server);

server.listen(process.env.PORT || 4001, () => console.log(`App is Up`));
