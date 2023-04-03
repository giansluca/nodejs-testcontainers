const config = require("./config");
const { JokeClient } = require("./jokeClient");
const { Joke } = require("../src/model/joke");
const { getRatesOf } = require("./exchangeRateClient");

async function getJoke() {
    console.log("Hello! this is a joke!");

    const jokeClient = new JokeClient(config.utils.jokeUrl);
    const joke = await jokeClient.getJoke();

    return new Joke(joke.setup, joke.delivery.toUpperCase());
}

async function getPoundValueOf(amount, symbol) {
    const rates = await getRatesOf(symbol);
    const poundRate = rates.GBP;

    const formatterEUR = new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
    });

    const formatterGBP = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    });
    const poundAmount = formatterGBP.format(poundRate * amount);

    console.log(`${formatterEUR.format(amount)} converted in ${poundAmount}`);

    return poundAmount;
}

module.exports = {
    getJoke: getJoke,
    getPoundValueOf: getPoundValueOf,
};
