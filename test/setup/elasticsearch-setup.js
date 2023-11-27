const { ElasticsearchContainer } = require("@testcontainers/elasticsearch");
const { Client } = require("@elastic/elasticsearch");

const elasticStart = async () => {
    const elasticsearchDb = await new ElasticsearchContainer("elasticsearch:8.6.1")
        .withEnvironment({
            "discovery.type": "single-node",
            "xpack.security.enabled": "false",
        })
        .start();

    return elasticsearchDb;
};

const getElasticClient = () => {
    const clientConfig = {
        node: process.env.ELASTICSEARCH_URL,
        auth: null,
        ssl: false,
    };

    return new Client(clientConfig);
};

module.exports = { elasticStart, getElasticClient };
