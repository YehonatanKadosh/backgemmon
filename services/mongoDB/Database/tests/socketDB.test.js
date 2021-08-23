const { removeSocket, newSocket, getSocketId } = require("../socketDB");

const { afterAll, beforeAll } = require("@jest/globals");
const mongoose = require("mongoose");
mongoose.connect(process.env.MOCKMongoKEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const { socketSchema } = require("../../models/socketSchema");
const { userSchema } = require("../../models/userSchema");
const { saveNewUser } = require("../userDB");
const Socket = mongoose.model("Socket", socketSchema);
const User = mongoose.model("User", userSchema);
let socket;
let user;

beforeAll(async () => {
  user = await saveNewUser({
    email: "socketDb@socketDb.com",
    password: "password",
    name: "israel",
  });
  socket = await newSocket(user.name, user._id, "0");
});

afterAll(async () => {
  await User.deleteOne({ email: "socketDb@socketDb.com" });
  await Socket.deleteOne({ socketId: "0" });
  await mongoose.connection.close();
});

describe("socketDB tests", () => {
  describe("saving new socket", () => {
    it(`should return the new socket`, async () => {
      expect(socket).toBeDefined();
    });

    it(`should return error if name or socketId or userId is missing`, async () => {
      await newSocket("0", "0").catch((err) => {
        expect(err).toBeDefined();
      });
    });
  });

  describe("get socket id", () => {
    it(`should return socketId for valid userId`, async () => {
      expect(await getSocketId(user._id)).toBeDefined();
    });

    it(`should return error for invalid userId or missing`, async () => {
      try {
        await getSocketId("l@email.com");
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });

  describe("remove socket", () => {
    it(`should return userId for valid socketId`, async () => {
      expect(await removeSocket(socket.socketId)).toBe(true);
    });

    it(`should return error for invalid socketId or missing socketId`, async () => {
      try {
        await getSocketId("l@email.com");
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });
});
