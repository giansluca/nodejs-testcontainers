const { getPostgresClient } = require("./setup/postgres-setup");
const { types } = require("pg");
const fs = require("fs");
const path = require("path");

let postgresClient;

beforeAll(async () => {
    try {
        postgresClient = getPostgresClient();
        postgresClient.connect();
        await setUpPostgresData();
    } catch (e) {
        console.log(e);
    }
});

afterAll(async () => {
    try {
        postgresClient.end();
    } catch (e) {
        console.log(e);
    }
});

describe("Test Postgres container", () => {
    it("should connect and get the test table name", async () => {
        // given
        const queryValues = ["public"];
        const query = "SELECT table_name FROM information_schema.tables WHERE table_schema = $1";

        // when
        const res = await postgresClient.query(query, queryValues);

        // then
        expect(res.rows[0].table_name).toBe("test_table");
    });

    it("should get by id", async () => {
        // given
        const expectedId = "id-1"
        const expectedOwnerId = "owner-1"
        const expectedTransactionDate = new Date("2022-02-16T20:38:40.123Z")
        const expectedAmount = 125.65
        const expectedDescription = "red tuna"

        const queryValues = [expectedId]
        const query = "SELECT * FROM test_table WHERE id = $1";

        // when 
        const res = await postgresClient.query(query, queryValues);
        const transaction = res.rows[0];

        // then
        expect(res.rows.length).toBe(1);
        expect(transaction).toBeDefined();
        expect(transaction.id).toBe(expectedId);
        expect(transaction.owner_id).toBe(expectedOwnerId);
        expect(transaction.transaction_date).toStrictEqual(expectedTransactionDate);
        expect(transaction.amount).toBe(expectedAmount);
        expect(transaction.description).toBe(expectedDescription);
    });

    it("should list all documents", async () => {
        // given
        const query = "SELECT * FROM test_table";

        // when
        const res = await postgresClient.query(query);
        const transactions = res.rows;

        // then
        expect(transactions.length).toBe(4)
    });

    it("should list by ownerId", async () => {
        // given
        const expectedOwnerId = "owner-1"
        const queryValues = [expectedOwnerId]
        const query = "SELECT * FROM test_table WHERE owner_id = $1";

        // when
        const res = await postgresClient.query(query, queryValues);
        const transactions = res.rows;

        // then
        expect(transactions.length).toBe(3)
        for (t of transactions) {
            expect(t.owner_id).toBe(expectedOwnerId)
        }
    });

    it("should insert a new record", async () => {
        // given
        const newId = "id-99";
        const newOwnerId = "owner-5";
        const newAmount = 100.01;
        const newDate = new Date();
        const newDescription = "pagamento salmone affumicato";

        const insertRow =
            "INSERT INTO test_table(id, owner_id, transaction_date, amount, description) VALUES($1, $2, $3, $4, $5) RETURNING *";
        const insertRowValues = [
            newId,
            newOwnerId,
            newDate,
            newAmount,
            newDescription
        ];

        // when
        await postgresClient.query(insertRow, insertRowValues);

        const queryValues = [newId];
        const query = "SELECT * FROM test_table WHERE id = $1";
        const res = await postgresClient.query(query, queryValues);

        const transaction = res.rows[0];

        // then
        expect(res.rows.length).toBe(1);
        expect(transaction).toBeDefined();
        expect(transaction.id).toBe(newId);
        expect(transaction.owner_id).toBe(newOwnerId);
        expect(transaction.transaction_date).toStrictEqual(newDate);
        expect(transaction.amount).toBe(newAmount);
        expect(transaction.description).toBe(newDescription);
    });
});

const setUpPostgresData = async () => {
    try {
        const sqlInitFile = loadPostgresInitFile();

        await postgresClient.query("BEGIN");
        postgresClient.query(sqlInitFile);
        await postgresClient.query("COMMIT");
    } catch (e) {
        await postgresClient.query("ROLLBACK");
        throw e;
    }
};

const loadPostgresInitFile = () => {
    const sqlInitFile = fs.readFileSync(path.join(__dirname, "setup/init-files/init-postgres.sql"), "utf8");
    return sqlInitFile;
};
