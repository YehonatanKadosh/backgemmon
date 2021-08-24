const request = require("supertest");
const { afterAll, afterEach, beforeAll } = require("@jest/globals");
const app = require("../../app");

const mongoose = require("mongoose");
const { createJsonWebToken } = require("../../services/JsonWebToken/JWT");
const {
  conversationScema,
} = require("../../services/mongoDB/models/conversationSchema");
const Conversation = mongoose.model("Conversation", conversationScema);
mongoose.connect(process.env.MOCKMongoKEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let token;

describe("GET /conversations", () => {
  beforeAll(async () => {
    token = await createJsonWebToken({
      _id: "israel",
      name: "israeli",
    });
  });
  afterAll(async () => {
    await Conversation.deleteOne({});
    await mongoose.connection.close();
  });

  describe("when user authenticated", () => {
    it(`should respond with a 200 status code,
     should respond with list of messages in the body,
     should specify json as the content type in the http header`, async () => {
      const response = await request(app)
        .get("/conversations")
        .query({ participants: ["Yaakob", "Moshe"] })
        .set("x-access-token", token);

      expect(response.statusCode).toBe(200);
      expect(response.bodys).toBeDefined();
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });
  });

  describe("participants check", () => {
    it(`should respond with a 400 status code if there is no participants`, async () => {
      const response = await request(app)
        .get("/conversations")
        .query({})
        .set("x-access-token", token);

      expect(response.statusCode).toBe(400);
    });

    it("should respond with a 400 status code if participants contains only 1 participant", async () => {
      const response = await request(app)
        .get("/conversations")
        .query({ participants: ["only-child"] })
        .set("x-access-token", token);
      expect(response.statusCode).toBe(400);
    });
  });
});
