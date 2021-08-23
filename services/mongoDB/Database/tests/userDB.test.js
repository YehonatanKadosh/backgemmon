const { afterAll, afterEach, beforeAll } = require("@jest/globals");
const { userSchema } = require("../../models/userSchema");
const mongoose = require("mongoose");
mongoose.connect(process.env.MOCKMongoKEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const User = mongoose.model("User", userSchema);
const { saveNewUser, findUser } = require("../userDB");

describe("userDB tests", () => {
  beforeAll(async () => {
    await saveNewUser({
      email: "userDB@userDB.com",
      password: "password",
      name: "israel",
    });
  });
  afterAll(async () => {
    await User.deleteOne({ email: "userDB@userDB.com" });
    await User.deleteOne({ email: "newuserDB@newuserDB.com" });
    await mongoose.connection.close();
  });

  describe("saving new // Checked in the userAPI test", () => {
    it("should return error if email, password or name missing", async () => {
      await saveNewUser({
        email: "userDB@userDB.com",
        name: "israel",
      }).catch((err) => expect(err).toBeDefined());
    });
  });

  describe("finding user", () => {
    it(`should return error`, async () => {
      await findUser("l@userDB.com").catch((err) => expect(err).toBeDefined());
    });
    it(`should return new User for valid user`, async () => {
      await findUser("userDB@userDB.com").then((user) =>
        expect(user).toBeDefined()
      );
    });
  });
});
