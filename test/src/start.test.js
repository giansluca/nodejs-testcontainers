const { startApp } = require("../../src/start");
const { Joke } = require("../../src/model/joke");

const mockGetJoke = jest.fn();
jest.mock("../../src/jokeClient", () => {
    return {
        JokeClient: jest.fn().mockImplementation(() => {
            return { getJoke: mockGetJoke };
        }),
    };
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Test Start", () => {
    it("should get the joke and transform the delivery in uppercase", async () => {
        // given
        mockGetJoke.mockReturnValue(new Joke("is this a joke?", "yes!"));

        // when
        const joke = await startApp();
        console.log(joke);

        const setupContainsLowercase = /[a-z]/.test(joke.setup);
        const deliveryContainsLowercase = /[a-z]/.test(joke.delivery);

        // then
        expect(joke).toBeDefined();
        expect(setupContainsLowercase).toBeTruthy();
        expect(deliveryContainsLowercase).toBeFalsy();
    });
});
