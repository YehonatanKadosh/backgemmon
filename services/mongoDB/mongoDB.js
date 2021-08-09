const mongo = require("mongoose");
const config = require("config");

mongo
  .connect(config.get("MongoKEY"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongoDb connected"))
  .catch((err) => console.error(err));
