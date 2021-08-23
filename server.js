require("dotenv").config();
const app = require("./app.js");
const server = require("http").createServer(app);
require("./services/socket.io/socketIo").Init(server);
require("./services/mongoDB/mongoDB");

server.listen(process.env.PORT || 4001, () => console.log(`App is Up`));
