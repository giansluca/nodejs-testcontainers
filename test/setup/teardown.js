module.exports = async () => {
    if (global._elasticsearchDb) {
        await global._elasticsearchDb.stop();
        console.log("Elasticsearch stopped");
    }

    if (global._postgresDb) {
        await global._postgresDb.stop();
        console.log("Postgres stopped");
    }
};
