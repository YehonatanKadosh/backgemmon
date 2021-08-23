const http = require("http");
const socketIOClient = require("socket.io-client");
const { afterAll, beforeAll } = require("@jest/globals");
const { Init } = require("../socketIo");
const { createJsonWebToken } = require("../../JsonWebToken/JWT");
const { saveNewUser } = require("../../mongoDB/Database/userDB");

const mongoose = require("mongoose");
mongoose.connect(process.env.MOCKMongoKEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const { userSchema } = require("../../mongoDB/models/userSchema");
const { socketSchema } = require("../../mongoDB/models/socketSchema");
const User = mongoose.model("User", userSchema);
const Socket = mongoose.model("Socket", socketSchema);

let httpServer, ioServer;
let httpServerDetails;
let token, disconnectingToken;
let user, disconnectingUser;
let socket, disconnectingsocket;

describe("socket io core", () => {
  beforeAll(async () => {
    httpServer = await http.createServer().listen();
    httpServerDetails = await httpServer.address();
    ioServer = Init(httpServer);
    user = await saveNewUser({
      email: "socketIOTesting@socketIOTesting.com",
      password: "socketIOTesting",
      name: "socketIOTesting",
    });

    token = await createJsonWebToken({
      _id: user._id,
      name: user.name,
    });

    disconnectingUser = await saveNewUser({
      email: "socketIODisconnect@socketIODisconnect.com",
      password: "socketIODisconnect",
      name: "socketIODisconnect",
    });

    disconnectingToken = await createJsonWebToken({
      _id: disconnectingUser._id,
      name: disconnectingUser.name,
    });

    socket = socketIOClient(
      `http://[${httpServerDetails.address}]:${httpServerDetails.port}`,
      {
        "reconnection delay": 0,
        "reopen delay": 0,
        "force new connection": true,
        transports: ["websocket"],
        extraHeaders: {
          "x-auth-token": token,
        },
        transportOptions: {
          polling: {
            extraHeaders: {
              "x-auth-token": token,
            },
          },
        },
      }
    );

    disconnectingsocket = socketIOClient(
      `http://[${httpServerDetails.address}]:${httpServerDetails.port}`,
      {
        "reconnection delay": 0,
        "reopen delay": 0,
        "force new connection": true,
        transports: ["websocket"],
        extraHeaders: {
          "x-auth-token": disconnectingToken,
        },
        transportOptions: {
          polling: {
            extraHeaders: {
              "x-auth-token": disconnectingToken,
            },
          },
        },
      }
    );
  });

  afterAll(async () => {
    if (socket.connected) {
      socket.disconnect();
    }
    await ioServer.close();
    await httpServer.close();
    await User.deleteMany({
      email: "socketIOTesting@socketIOTesting.com",
    });
    await User.deleteMany({
      email: "socketIODisconnect@socketIODisconnect.com",
    });
    await mongoose.connection.close();
  });

  describe("new connection", () => {
    it("should send back the socket connected for valid user", (done) => {
      socket.on("new-connection", (mySocket) => {
        expect(mySocket).toBeDefined();
        expect(socket.connected).toBe(true);
        done();
      });
    });
    it("should send back error for invalid token", () => {
      const newSocket = socketIOClient(
        `http://[${httpServerDetails.address}]:${httpServerDetails.port}`,
        {
          "reconnection delay": 0,
          "reopen delay": 0,
          "force new connection": true,
          transports: ["websocket"],
          timeout: 2000,
        }
      );
      setTimeout(async () => {
        expect(newSocket.connected).toBe(false);
      }, 2500);
    });
    it("should send back error for valid token but invalid user", async () => {
      const newToken = await createJsonWebToken({
        _id: "israel",
        name: "israeli",
      });
      const newSocket = socketIOClient(
        `http://[${httpServerDetails.address}]:${httpServerDetails.port}`,
        {
          timeout: 2000,
          "reconnection delay": 0,
          "reopen delay": 0,
          "force new connection": true,
          transports: ["websocket"],
          extraHeaders: {
            "x-auth-token": newToken,
          },
          transportOptions: {
            polling: {
              extraHeaders: {
                "x-auth-token": newToken,
              },
            },
          },
        }
      );
      setTimeout(() => {
        expect(newSocket.connected).toBe(false);
      }, 2500);
    });
  });

  describe("connecting twice", () => {
    it("should send back 'connected-on-another-device' event", (done) => {
      const newSocket = socketIOClient(
        `http://[${httpServerDetails.address}]:${httpServerDetails.port}`,
        {
          "reconnection delay": 0,
          "reopen delay": 0,
          "force new connection": true,
          transports: ["websocket"],
          extraHeaders: {
            "x-auth-token": token,
          },
          transportOptions: {
            polling: {
              extraHeaders: {
                "x-auth-token": token,
              },
            },
          },
        }
      );
      newSocket.on("connected-on-another-device", () => {
        done();
      });
    });
  });

  describe("disconnect", () => {
    it("should send the use id to every other connected socket", (done) => {
      socket.on("user-disconnected", (userId) => {
        expect(userId).toBeDefined();
        expect(disconnectingsocket.connected).toBe(false);
        done();
      });
      disconnectingsocket.disconnect();
    });
  });
});
