const mongo = require("mongoose");
const config = require("config");
const { socketSchema } = require("./models/socketSchema");
const Socket = mongo.model("Socket", socketSchema);

mongo
  .connect(config.get("MongoKEY"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongoDb connected"))
  .catch((err) => console.error(err));

const handleDisconnect = (mongoError) => {
  Socket.deleteMany({});
};

mongo.connection.on("disconnecting", handleDisconnect);
