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
        await clearPostgresData();
        postgresClient.end();
    } catch (e) {
        console.log(e);
    }
});

describe("Test Postgres container", () => {
    it("should connect and get the test table name", async () => {
        // given
        const selectValues = ["public"];
        const selectQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = $1";

        // when
        const res = await postgresClient.query(selectQuery, selectValues);

        // then
        expect(res.rows[0].table_name).toBe("test_table");
    });

    it("should get by id", async () => {
        // given
        const expectedId = "id-1";
        const expectedOwnerId = "owner-1";
        const expectedTransactionDate = new Date("2022-02-16T20:38:40.123Z");
        const expectedAmount = 125.65;
        const expectedDescription = "red tuna";

        const selectValues = [expectedId];
        const selectQuery = "SELECT * FROM test_table WHERE id = $1";

        // when
        const res = await postgresClient.query(selectQuery, selectValues);
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

    it("should list all", async () => {
        // given
        const selectQuery = "SELECT * FROM test_table";

        // when
        const res = await postgresClient.query(selectQuery);
        const transactions = res.rows;

        // then
        expect(transactions.length).toBe(4);
    });

    it.each([
        ["owner-1", 3],
        ["owner-2", 1],
    ])(`should list by ownerId: [%s - %i]`, async (ownerId, expectedRows) => {
        const expectedOwnerId = ownerId;

        const selectValues = [expectedOwnerId];
        const selectQuery = "SELECT * FROM test_table WHERE owner_id = $1";

        // when
        const res = await postgresClient.query(selectQuery, selectValues);
        const transactions = res.rows;

        // then
        expect(transactions.length).toBe(expectedRows);
        for (t of transactions) {
            expect(t.owner_id).toBe(expectedOwnerId);
        }
    });

    it("should insert a new record", async () => {
        // given
        const newId = "id-99";
        const newOwnerId = "owner-5";
        const newAmount = 100.01;
        const newDate = new Date();
        const newDescription = "pagamento salmone affumicato";

        const insertValues = [newId, newOwnerId, newDate, newAmount, newDescription];
        const insertQuery =
            "INSERT INTO test_table(id, owner_id, transaction_date, amount, description) VALUES($1, $2, $3, $4, $5) RETURNING *";

        // when
        await postgresClient.query(insertQuery, insertValues);

        const selectValues = [newId];
        const selectQuery = "SELECT * FROM test_table WHERE id = $1";
        const res = await postgresClient.query(selectQuery, selectValues);
        const transaction = res.rows[0];

        // then
        expect(res.rows.length).toBe(1);
        expect(transaction).toBeDefined();
        expect(transaction.id).toBe(newId);
        expect(transaction.owner_id).toBe(newOwnerId);
        expect(transaction.transaction_date).toStrictEqual(newDate);
        expect(transaction.amount).toBe(newAmount);
        expect(transaction.description).toBe(newDescription);

        // clean - delete inserted record
        await postgresClient.query(`DELETE FROM test_table WHERE id = '${newId}'`);
    });

    it("should update by id", async () => {
        // given
        const updatedAmount = 175.15;
        const updatedDate = new Date("2022-04-15T00:35:10.000Z");
        const idToUpdate = "id-1";

        const updateValues = [updatedDate, updatedAmount, idToUpdate];
        const updateQuery = "UPDATE test_table SET transaction_date = $1, amount = $2 WHERE id = $3";

        // when
        await postgresClient.query(updateQuery, updateValues);

        const selectValues = [idToUpdate];
        const selectQuery = "SELECT * FROM test_table WHERE id = $1";
        const res = await postgresClient.query(selectQuery, selectValues);
        const transaction = res.rows[0];

        // then
        expect(res.rows.length).toBe(1);
        expect(transaction).toBeDefined();
        expect(transaction.id).toBe(idToUpdate);
        expect(transaction.owner_id).toBe("owner-1");
        expect(transaction.transaction_date).toStrictEqual(updatedDate);
        expect(transaction.amount).toBe(updatedAmount);
        expect(transaction.description).toBe("red tuna");
    });

    it("should delete by id", async () => {
        // given
        const idToDelete = "id-4";

        const deleteValues = [idToDelete];
        const deleteQuery = "DELETE FROM test_table WHERE id = $1";

        // when
        await postgresClient.query(deleteQuery, deleteValues);

        const selectValuesById = [idToDelete];
        const selectQueryById = "SELECT * FROM test_table WHERE id = $1";
        const resById = await postgresClient.query(selectQueryById, selectValuesById);
        const transactionById = resById.rows[0];

        const selectQueryAll = "SELECT * FROM test_table";
        const resAll = await postgresClient.query(selectQueryAll);
        const transactionsAll = resAll.rows;

        // then
        expect(resById.rows.length).toBe(0);
        expect(transactionById).toBeUndefined();
        expect(transactionsAll.length).toBe(3);
    });
});

const setUpPostgresData = async () => {
    try {
        const { setupDbSql, initDataSql } = loadPostgresInitFile();

        await postgresClient.query("BEGIN");
        postgresClient.query(setupDbSql);
        postgresClient.query(initDataSql);
        await postgresClient.query("COMMIT");
    } catch (e) {
        await postgresClient.query("ROLLBACK");
        throw e;
    }
};

const loadPostgresInitFile = () => {
    const setupDbSql = fs.readFileSync(path.join(__dirname, "setup/init-files/setup-postgres.sql"), "utf8");
    const initDataSql = fs.readFileSync(path.join(__dirname, "setup/init-files/init-data-postgres.sql"), "utf8");
    return { setupDbSql, initDataSql };
};

const clearPostgresData = async () => {
    await postgresClient.query("DROP TABLE test_table;");
};
