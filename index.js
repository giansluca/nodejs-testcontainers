const { getJoke, getPoundValueOf } = require("./src/start");

(async function main() {
    await getJoke();
    await getPoundValueOf(20.5, "EUR");
})();
