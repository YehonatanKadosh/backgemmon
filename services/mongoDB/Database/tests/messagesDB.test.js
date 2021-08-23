const { afterAll, beforeAll } = require("@jest/globals");
const mongoose = require("mongoose");
const { messageSchema } = require("../../models/messageSchema");
const { newMessage, getMessages } = require("../messagesDB");
mongoose.connect(process.env.MOCKMongoKEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const Message = mongoose.model("Message", messageSchema);
let message;

describe("messageDB tests", () => {
  beforeAll(async () => {
    message = await newMessage({
      senderId: "senderId",
      message: "message",
      conversationId: "conversationId",
      time: new Date(),
    });
  });

  afterAll(async () => {
    await Message.deleteOne({ _id: message._id });
    await mongoose.connection.close();
  });

  describe("new message", () => {
    it(`should return the new message`, async () => {
      expect(message).toBeDefined();
    });

    it(`should return error if senderId or message or conversationId or time is missing`, async () => {
      await newMessage({ senderId: "senderId", message: "message" }).catch(
        (err) => {
          expect(err).toBeDefined();
        }
      );
    });
  });

  describe("get messages by convesation id", () => {
    it(`should return messages for valid convesation id`, async () => {
      expect(await getMessages(message.conversationId)).toBeDefined();
    });

    it(`should return error for invalid convesation id or missing`, async () => {
      try {
        await getMessages("funky conversation id");
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });
});
