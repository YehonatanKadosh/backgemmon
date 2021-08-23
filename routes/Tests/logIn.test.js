const request = require("supertest");
const { afterAll, beforeAll } = require("@jest/globals");
const app = require("../../app");
const mongoose = require("mongoose");
const { userSchema } = require("../../services/mongoDB/models/userSchema");
const { saveNewUser } = require("../../services/mongoDB/Database/userDB");
const User = mongoose.model("User", userSchema);

mongoose.connect(process.env.MOCKMongoKEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

describe("POST /logIn", () => {
  beforeAll(async () => {
    await saveNewUser({
      email: "login@login.com",
      password: "password",
      name: "israel",
    });
  });
  afterAll(async () => {
    await User.deleteOne({ email: "login@login.com" });
    await mongoose.connection.close();
  });

  describe("when passed email and password correctly", () => {
    it(`should respond with a 200 status code, 
     should contain token response header 'x-access-token', 
     should respond with _id and name back in the body, 
     should specify json as the content type in the http header
     `, async () => {
      const response = await request(app).post("/logIn").send({
        email: "login@login.com",
        password: "password",
      });

      expect(response.statusCode).toBe(200);
      expect(response.header).toHaveProperty("x-access-token");
      expect(response.body.name).toBe("israel");
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });
  });

  describe("when the email or password is missing or invalid", () => {
    it("no email should return status 400 with error", async () => {
      const response = await request(app).post("/users/add").send({
        password: "password",
      });
      expect(response.statusCode).toBe(400);
      expect(response.text).toBeDefined();
    });

    it("no password should return status 400 with error", async () => {
      const response = await request(app).post("/users/add").send({
        email: "login@login.com",
      });
      expect(response.statusCode).toBe(400);
      expect(response.text).toBeDefined();
    });

    it("invalid email should return status 400 with error", async () => {
      const response = await request(app).post("/users/add").send({
        email: "login@ema.com",
        password: "password",
      });
      expect(response.statusCode).toBe(400);
      expect(response.text).toBeDefined();
    });

    it("invalid password should return status 400 with error", async () => {
      const response = await request(app).post("/users/add").send({
        email: "login@login.com",
        password: "w",
      });
      expect(response.statusCode).toBe(400);
      expect(response.text).toBeDefined();
    });
  });
});
