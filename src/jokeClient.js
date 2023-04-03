const axios = require("axios");
const { Joke } = require("./model/joke");

class JokeClient {
    constructor(jokeUrl) {
        this.jokeUrl = jokeUrl;
    }

    async getJoke() {
        try {
            const { data } = await axios.get(`${this.jokeUrl}?amount=1&type=twopart`);
            return new Joke(data.setup, data.delivery);
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = {
    JokeClient: JokeClient,
};
