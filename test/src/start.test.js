const { startApp } = require("../../src/start");

const mockGetJoke = jest.fn().mockReturnValue({ setup: "test-1", delivery: "test:2" });
jest.mock("../../src/jokeClient", () => {
    return {
        JokeClient: jest.fn().mockImplementation(() => {
            return { getJoke: mockGetJoke };
        }),
    };
});

describe("Test Start", () => {
    it("should pass", async () => {
        await startApp();
    });
});
