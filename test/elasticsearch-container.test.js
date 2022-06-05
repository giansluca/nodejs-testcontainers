const { getElasticClient } = require("./setup/elasticsearch-setup");
const { sleep, toSnakeCase } = require("../src/utils");
const fs = require("fs");
const path = require("path");

const INDEX = "test-index";
let elasticClient;

beforeAll(async () => {
    try {
        elasticClient = getElasticClient();
        await setUpElasticData();
        await sleep(1000); // --> this delay is needed in between indexing and read data
    } catch (e) {
        console.log(e);
    }
});

afterAll(async () => {
    try {
        await clearElasticData();
    } catch (e) {
        console.log(e);
    }
});

describe("Test Elasticsearch container", () => {
    it("should get all indexes", async () => {
        // given
        // when
        const indices = await elasticClient.cat.indices({ format: "json" });
        const exist = await elasticClient.indices.exists({ index: INDEX });

        // then
        expect(indices.length).toBe(1);
        expect(exist).toBeTruthy();
    });

    it("should get by id", async () => {
        // given
        const expectedId = "id-1";

        // when
        const document = await elasticClient.get({
            index: INDEX,
            id: expectedId,
        });

        const transaction = document._source;

        // then
        expect(transaction).toBeDefined();
        expect(transaction.id).toBe(expectedId);
    });

    it("should list all documents", async () => {
        // given
        const query = {
            match_all: {},
        };

        // when
        const result = await elasticClient.search({
            index: INDEX,
            body: {
                size: 1000,
                sort: [{ transaction_date: { order: "desc" } }],
                query: query,
            },
        });
        const documents = result.hits.hits;
        const firstTransaction = documents[0]._source;

        // then
        expect(documents.length).toBe(3);
        expect(firstTransaction.id).toBe("id-3");
    });

    it("should list documents by ownerId", async () => {
        // given
        const FIELD_OWNER_ID = "owner_id.keyword";
        const expectedOwnerId = "ow-1";

        const query = {
            bool: {
                must: [
                    {
                        term: { [FIELD_OWNER_ID]: expectedOwnerId },
                    },
                ],
            },
        };

        // when
        const result = await elasticClient.search({
            index: INDEX,
            body: {
                size: 1000,
                sort: [{ transaction_date: { order: "asc" } }],
                query: query,
            },
        });
        const documents = result.hits.hits;
        const firstTransaction = documents[0]._source;
        const secondTransaction = documents[1]._source;

        // then
        expect(documents.length).toBe(2);
        expect(firstTransaction.id).toBe("id-1");
        expect(firstTransaction.owner_id).toBe(expectedOwnerId);
        expect(secondTransaction.id).toBe("id-2");
        expect(secondTransaction.owner_id).toBe(expectedOwnerId);
    });

    it("should insert a new document", async () => {
        // given
        const idNew = "id-new";

        const newTransaction = {
            id: idNew,
            ownerId: "ow-3",
            transactionDate: "2022-04-19",
            amount: 99,
            description: "Merluzzetti",
        };

        await elasticClient.index({
            index: INDEX,
            id: newTransaction.id,
            document: toSnakeCase(newTransaction),
        });

        // when
        const document = await elasticClient.get({
            index: INDEX,
            id: idNew,
        });

        const transaction = document._source;

        // then
        expect(transaction).toBeDefined();
        expect(transaction.id).toBe(idNew);
        expect(transaction.owner_id).toBe("ow-3");
        expect(transaction.transaction_date).toBe("2022-04-19");
        expect(transaction.amount).toBe(99);
    });

    it("should update by id", async () => {
        // given
        const idToUpdate = "id-1";

        // when
        await elasticClient.update({
            index: INDEX,
            id: idToUpdate,
            doc: {
                amount: -271,
            },
        });

        const document = await elasticClient.get({
            index: INDEX,
            id: idToUpdate,
        });

        const transaction = document._source;

        // then
        expect(transaction.id).toBe(idToUpdate);
        expect(transaction.owner_id).toBe("ow-1");
        expect(transaction.amount).toBe(-271);
    });

    it("should delete by id", async () => {
        // given
        const idToDelete = "id-1";

        // when
        await elasticClient.delete({
            index: INDEX,
            id: idToDelete,
        });

        // then
        try {
            const document = await elasticClient.get({
                index: INDEX,
                id: idToDelete,
            });
        } catch (e) {
            expect(e.meta.statusCode).toBe(404);
        }
    });
});

const setUpElasticData = async () => {
    const transactions = JSON.parse(loadElasticInitFile());
    const snakeCaseTransactions = toSnakeCase(transactions);

    for (const t of snakeCaseTransactions) {
        await elasticClient.index({
            index: INDEX,
            id: t.id,
            document: t,
        });
    }
};

loadElasticInitFile = () => {
    const jsonInitFile = fs.readFileSync(path.join(__dirname, "setup/init-files/init-elastic.json"), "utf8");
    return jsonInitFile;
};

const clearElasticData = async () => {
    await elasticClient.indices.delete({
        index: INDEX,
    });
};
