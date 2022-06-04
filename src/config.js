const ENV = process.env.ENV || "dev";
if (ENV !== "prod") {
    require("dotenv").config();
}
const pkg = require("../package");

const config = {
    env: process.env.ENV || "local",
    app: {
        name: process.env.APP_NAME || "NodeDemo",
        version: pkg.version,
        commit: process.env.APP_COMMIT
    },
    utils: {
        testUrl: process.env.TEST_URL
    }
};

module.exports = config;
