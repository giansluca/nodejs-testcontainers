const { ElasticsearchContainer } = require("testcontainers");
const { Client } = require("@elastic/elasticsearch");

const elasticStart = async () => {
    const elasticsearchDb = await new ElasticsearchContainer("elasticsearch:8.2.0")
        .withEnv("discovery.type", "single-node")
        .withEnv("xpack.security.enabled", "false")
        .start();

    return elasticsearchDb;
};

const getElasticClient = () => {
    const clientConfig = {
        node: process.env._ELASTICSEARCH_URL,
        auth: null,
        ssl: false
    };

    return new Client(clientConfig);
}

module.exports = { elasticStart, getElasticClient };