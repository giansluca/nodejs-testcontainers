const ENV = process.env.ENV || "dev";
if (ENV !== "prod") {
    require("dotenv").config();
}
const pkg = require("../package");

const config = {
    env: process.env.ENV || "local",
    app: {
        name: process.env.APP_NAME || "nodejs-testcontainers",
        version: pkg.version,
        commit: process.env.APP_COMMIT,
    },
    utils: {
        jokeUrl: process.env.JOKE_URL,
    },
};

module.exports = config;
