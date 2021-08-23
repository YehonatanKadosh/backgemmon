const request = require("supertest");
const { afterAll, beforeAll } = require("@jest/globals");
const app = require("../app");

const mongoose = require("mongoose");
const { createJsonWebToken } = require("../services/JsonWebToken/JWT");
mongoose.connect(process.env.MOCKMongoKEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let token;

describe("GET auth middleware", () => {
  beforeAll(async () => {
    token = await createJsonWebToken({
      _id: "israel",
      name: "israeli",
    });
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("when user authenticated", () => {
    it(`should respond with a 200 status code, 
     should respond with list of sockets in the body,
     should specify json as the content type in the http header`, async () => {
      const response = await request(app)
        .get("/sockets")
        .set("x-access-token", token);

      expect(response.statusCode).toBe(200);
      expect(response.body.sockets).toBeDefined();
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });
  });

  describe("when user token not authenticated", () => {
    it(`should respond with a 400 status code`, async () => {
      const response = await request(app)
        .get("/sockets")
        .set("x-access-token", "abra-kadabra");

      expect(response.statusCode).toBe(400);
    });
  });
});
