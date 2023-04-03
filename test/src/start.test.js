const { getJoke, getPoundValueOf } = require("../../src/start");
const { Joke } = require("../../src/model/joke");

const mockGetJoke = jest.fn();
jest.mock("../../src/jokeClient", () => {
    return {
        JokeClient: jest.fn().mockImplementation(() => {
            return { getJoke: mockGetJoke };
        }),
    };
});

const mockGetPoundValueOf = jest.fn();
jest.mock("../../src/exchangeRateClient", () => ({
    getRatesOf: () => mockGetPoundValueOf(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Test Start", () => {
    it("should get the joke and transform the delivery in uppercase", async () => {
        // given
        mockGetJoke.mockReturnValue(new Joke("is this a joke?", "yes!"));

        // when
        const joke = await getJoke();
        console.log(joke);

        const setupContainsLowercase = /[a-z]/.test(joke.setup);
        const deliveryContainsLowercase = /[a-z]/.test(joke.delivery);

        // then
        expect(joke).toBeDefined();
        expect(setupContainsLowercase).toBeTruthy();
        expect(deliveryContainsLowercase).toBeFalsy();
    });

    it("should convert from euro to pound", async () => {
        // given
        mockGetPoundValueOf.mockReturnValue({ GBP: 0.8 });

        // when
        const poundAmount = await getPoundValueOf(15.4, "EUR");

        // then
        expect(poundAmount).toBe("£12.32");
    });
});
