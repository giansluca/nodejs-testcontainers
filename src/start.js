const config = require("./config");
const { JokeClient } = require("./jokeClient");
const { Joke } = require("../src/model/joke");

async function startApp() {
    console.log("Hello! this is a joke!");

    const jokeClient = new JokeClient(config.utils.jokeUrl);
    const joke = await jokeClient.getJoke();

    return new Joke(joke.setup, joke.delivery.toUpperCase());
}

module.exports = { startApp };
