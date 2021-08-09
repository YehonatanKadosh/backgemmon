const express = require("express");
const cors = require("cors");
const user = require("./routes/userAPI");
const message = require("./routes/messageAPI");
const notFound = require("./routes/404API");

const app = express();
app.use(cors({ exposedHeaders: "x-access-token" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", user);
app.use("/messages", message);
app.use("/**", notFound);

const server = require("http").createServer(app);
// services
require("./services/mongoDB/mongoDB");
require("./services/socketIo").Init(server);

server.listen(process.env.PORT || 4001, () => console.log(`App is Up`));
