const { getElasticClient } = require("./setup/elasticsearch-setup");
const { sleep, formatDate, toSnakeCase } = require("../src/utils");
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
        await elasticClient.close();
    } catch (e) {
        console.log(e);
    }
});

describe("Test Elasticsearch container", () => {
    it("should check index has been created", async () => {
        // given
        // when
        const indices = await elasticClient.cat.indices({ format: "json" });
        const exist = await elasticClient.indices.exists({ index: INDEX });

        // then
        expect(indices.length).toBe(1);
        expect(exist).toBeTruthy();
    });

    it("should have created the correct index mapping", async () => {
        // given
        // when
        const mapping = await elasticClient.indices.getMapping({
            index: INDEX,
        });

        //console.log(util.inspect(mapping, { depth: null }));
        const properties = mapping[INDEX].mappings.properties;

        // then
        expect(properties.id.type).toBe("text");
        expect(properties.description.type).toBe("text");
        expect(properties.amount.type).toBe("long");
        expect(properties.owner_id.type).toBe("text");
        expect(properties.transaction_date.type).toBe("date");
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
        expect(transaction.owner_id).toBe("ow-1");
        expect(transaction.transaction_date).toBe("2022-02-11");
        expect(transaction.amount).toBe(-270);
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
        expect(firstTransaction.owner_id).toBe("ow-3");
        expect(firstTransaction.transaction_date).toBe("2022-04-17");
        expect(firstTransaction.amount).toBe(25);
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
        expect(firstTransaction.transaction_date).toBe("2022-02-11");
        expect(firstTransaction.amount).toBe(-270);

        expect(secondTransaction.id).toBe("id-2");
        expect(secondTransaction.owner_id).toBe(expectedOwnerId);
        expect(secondTransaction.transaction_date).toBe("2022-03-21");
        expect(secondTransaction.amount).toBe(150);
    });

    it("should insert a new document", async () => {
        // given
        const newTransaction = {
            id: "idNew",
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
            id: newTransaction.id,
        });

        const transaction = document._source;

        // then
        expect(transaction).toBeDefined();
        expect(transaction.id).toBe(newTransaction.id);
        expect(transaction.owner_id).toBe(newTransaction.ownerId);
        expect(transaction.transaction_date).toBe(newTransaction.transactionDate);
        expect(transaction.amount).toBe(newTransaction.amount);
    });

    it("should update by id", async () => {
        // given
        const idToUpdate = "id-1";
        const updatedAmount = -271;
        const updatedDate = formatDate(new Date());

        // when
        await elasticClient.update({
            index: INDEX,
            id: idToUpdate,
            doc: {
                amount: updatedAmount,
                transaction_date: updatedDate,
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
        expect(transaction.amount).toBe(updatedAmount);
        expect(transaction.transaction_date).toBe(updatedDate);
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
            await elasticClient.get({
                index: INDEX,
                id: idToDelete,
            });
        } catch (e) {
            expect(e.meta.statusCode).toBe(404);
        }
    });
});

const setUpElasticData = async () => {
    const documents = JSON.parse(loadElasticInitFile());
    const snakeCaseDocuments = toSnakeCase(documents);

    for (const d of snakeCaseDocuments) {
        await elasticClient.index({
            index: INDEX,
            id: d.id,
            document: d,
        });
    }
};

const loadElasticInitFile = () => {
    const initDataJson = fs.readFileSync(path.join(__dirname, "setup/init-files/init-data-elastic.json"), "utf8");
    return initDataJson;
};

const clearElasticData = async () => {
    await elasticClient.indices.delete({
        index: INDEX,
    });
};
