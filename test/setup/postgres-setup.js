const { PostgreSqlContainer } = require("testcontainers");
const { types, Client } = require('pg')

const postgresStart = async () => {
    const postgresDb = await new PostgreSqlContainer("postgres:14.2").start();
    return postgresDb;
};

const getPostgresClient = () => {
    types.setTypeParser(1700, x => parseFloat(x));
    return new Client(process.env._POSTGRES_URL);
}

module.exports = { postgresStart, getPostgresClient };
