const { elasticStart } = require("./elasticsearch-setup");
const { postgresStart } = require("./postgres-setup");

module.exports = async () => {
    await startElasticsearch();
    await startPostgres();
};

const startElasticsearch = async () => {
    const elasticsearchDb = await elasticStart();

    process.env.ELASTICSEARCH_URL = elasticsearchDb.getHttpUrl();
    global._elasticsearchDb = elasticsearchDb;

    console.log("Elasticsearch started");
};

const startPostgres = async () => {
    const postgresDb = await postgresStart();
    const postgresUrl = `postgres://${postgresDb.getUsername()}:${postgresDb.getPassword()}@${postgresDb.getHost()}:${postgresDb.getPort()}/${postgresDb.getDatabase()}`;

    process.env.POSTGRES_URL = postgresUrl;
    global._postgresDb = postgresDb;

    console.log("Postgres started");
};
