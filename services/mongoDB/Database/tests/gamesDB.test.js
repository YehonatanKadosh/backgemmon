const { afterAll, beforeAll } = require("@jest/globals");
const mongoose = require("mongoose");
const { gameSchema } = require("../../models/gameSchema");
const { createNewGame } = require("../../../GameLogic/GameLogic");
mongoose.connect(process.env.MOCKMongoKEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const Game = mongoose.model("Game", gameSchema);
let game;

describe("messageDB tests", () => {
  beforeAll(async () => {
    game = await createNewGame(["first participants", "second participant"]);
  });

  afterAll(async () => {
    await Game.deleteOne({ _id: game._id });
    await mongoose.connection.close();
  });

  describe("new game", () => {
    it(`should return 2 participants and board with 24 cells`, async () => {
      expect(game.participants.length).toBe(2);
      expect(game.board.length).toBe(26);
    });
  });
});
