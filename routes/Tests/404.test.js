const request = require("supertest");
const app = require("../../app");

describe("request goes to unknown direction", () => {
  it(`should respond with a 404 status code`, async () => {
    const response = await request(app).post("/abra-kadaba");
    expect(response.statusCode).toBe(404);
  });
});
