const axios = require("axios");

async function getRatesOf(symbol) {
    try {
        const { data } = await axios.get(`https://open.er-api.com/v6/latest/${symbol}`);
        return data.rates;
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    getRatesOf: getRatesOf,
};
