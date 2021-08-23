const request = require("supertest");
const { afterAll, afterEach, beforeAll } = require("@jest/globals");
const app = require("../../app");

const mongoose = require("mongoose");
const { userSchema } = require("../../services/mongoDB/models/userSchema");
const User = mongoose.model("User", userSchema);
mongoose.connect(process.env.MOCKMongoKEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

describe("POST /users/add", () => {
  afterEach(async () => {
    await User.deleteOne({ email: "user@user.com" });
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("when passed name, email and password correctly", () => {
    it(`should respond with a 200 status code, 
     should contain token response header 'x-access-token', 
     should respond with _id and name back in the body, 
     should specify json as the content type in the http header
     `, async () => {
      const response = await request(app).post("/users/add").send({
        email: "user@user.com",
        password: "password",
        name: "israel",
      });
      expect(response.statusCode).toBe(200);
      expect(response.header).toHaveProperty("x-access-token");
      expect(response.body.name).toBe("israel");
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });
  });

  describe("when the email or password or name is missing or invalid", () => {
    it("no email should return status 400 with error", async () => {
      const response = await request(app).post("/users/add").send({
        password: "password",
        name: "israel",
      });

      expect(response.statusCode).toBe(400);
      expect(response.text).toBeDefined();
    });

    it("no password should return status 400 with error", async () => {
      const response = await request(app).post("/users/add").send({
        email: "user@user.com",
        name: "israel",
      });
      expect(response.statusCode).toBe(400);
      expect(response.text).toBeDefined();
    });

    it("no name should return status 400 with error", async () => {
      const response = await request(app).post("/users/add").send({
        email: "user@user.com",
        password: "password",
      });
      expect(response.statusCode).toBe(400);
      expect(response.text).toBeDefined();
    });

    it("password invalid should return status 400 with error", async () => {
      const response = await request(app).post("/users/add").send({
        email: "user@user.com",
        password: "w",
        name: "israel",
      });
      expect(response.statusCode).toBe(400);
      expect(response.text).toBeDefined();
    });

    it("Email invalid should return status 400 with error", async () => {
      const response = await request(app).post("/users/add").send({
        email: "user",
        password: "password",
        name: "israel",
      });
      expect(response.statusCode).toBe(400);
      expect(response.text).toBeDefined();
    });

    it("name invalid should return status 400 with error", async () => {
      const response = await request(app).post("/users/add").send({
        email: "user@user.com",
        password: "password",
        name: "i",
      });
      expect(response.statusCode).toBe(400);
      expect(response.text).toBeDefined();
    });
  });
});
