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

describe.skip("Test Postgres container", () => {
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
        const expectedId = "id-1";
        const expectedOwnerId = "owner-1";
        const expectedAmount = 125.65;

        const insertRow =
            "INSERT INTO test_table(id, owner_id, transaction_date, amount, description) VALUES($1, $2, $3, $4, $5) RETURNING *";
        const insertRowValues = [
            expectedId,
            expectedOwnerId,
            new Date(),
            expectedAmount,
            "pagamento salmone affumicato",
        ];

        await postgresClient.query(insertRow, insertRowValues);

        // when
        const queryValues = [expectedId];
        const query = "SELECT * FROM test_table WHERE id = $1";
        const res = await postgresClient.query(query, queryValues);

        const transaction = res.rows[0];

        // then
        expect(res.rows.length).toBe(1);
        expect(transaction).toBeDefined();
        expect(transaction.id).toBe(expectedId);
        expect(transaction.owner_id).toBe(expectedOwnerId);
        expect(transaction.amount).toBe(expectedAmount);
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
