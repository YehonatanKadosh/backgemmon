const http = require("http");
const io = require("socket.io-client");
const { afterAll, beforeEach, afterEach, beforeAll } = require("@jest/globals");
const { Init } = require("../socketIo");
const { createJsonWebToken } = require("../../JsonWebToken/JWT");
const { saveNewUser } = require("../../mongoDB/Database/userDB");

const mongoose = require("mongoose");
// mongoose.connect(process.env.MOCKMongoKEY, {
//   useNewUrlParser: true,
// });
const { userSchema } = require("../../mongoDB/models/userSchema");
const { newSocket } = require("../../mongoDB/Database/socketDB");
const User = mongoose.model("User", userSchema);
let socket;
let httpServer;
let httpServerDetails;
let ioServer;
let token;
let user;

test("", () => {
  expect(true).toBe(true);
});
