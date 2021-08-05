const express = require("express");
const app = express();
const user = require("./routes/userAPI");
const notFound = require("./routes/notFound");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/userApi", user);
app.use("/**", notFound);

app.listen(process.env.PORT || 3000, () => {
  console.log("app is Up");
});
