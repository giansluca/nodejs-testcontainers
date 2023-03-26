const config = require("./config");
const { JokeClient } = require("./jokeClient");

async function startApp() {
    console.log("Hello! this is a joke!");

    const jokeClient = new JokeClient(config.utils.jokeUrl);
    const joke = await jokeClient.getJoke();

    console.log(joke);
}

module.exports = { startApp };
