const config = require("./config");

const startApp = () => {
    console.log("Hello! this is a start :D");
    console.log(config.utils.testUrl);
};

module.exports = { startApp };
