const axios = require("axios");

class JokeClient {
    constructor(jokeUrl) {
        this.jokeUrl = jokeUrl;
    }

    async getJoke() {
        const { data } = await axios.get(`${this.jokeUrl}?amount=1&type=twopart`);
        return new Joke(data.setup, data.delivery);
    }
}

class Joke {
    constructor(setup, delivery) {
        (this.setup = setup), (this.delivery = delivery);
    }
}

module.exports = {
    Joke: Joke,
    JokeClient: JokeClient,
};
