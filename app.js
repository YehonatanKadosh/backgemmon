const express = require("express");
const app = express();
const user = require("./routes/userAPI");
const message = require("./routes/messaging");
const notFound = require("./routes/notFound");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/messageAPI", message);
app.use("/userApi", user);
app.use("/**", notFound);

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");
  //  socket.emit("FromAPI", new Date()); // send the message
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const mongo = require("mongoose");
const config = require("config");
mongo
  .connect(config.get("MongoKEY"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongoDb connected"))
  .catch((err) => console.error(err));

server.listen(process.env.PORT || 4001, () => console.log(`App is Up`));
