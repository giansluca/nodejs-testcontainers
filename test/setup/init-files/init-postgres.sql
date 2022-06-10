CREATE TABLE IF NOT EXISTS test_table (
  id                        VARCHAR(36) PRIMARY KEY, 
  owner_id                  VARCHAR(36) NOT NULL, 
  transaction_date          TIMESTAMPTZ, 
  amount                    NUMERIC, 
  description               VARCHAR(512),
  document                  jsonb,
  doc_lines                 jsonb
);

INSERT INTO test_table(id, owner_id, transaction_date, amount, description, document, doc_lines) VALUES('id-1', 'owner-1', '2022-02-16T20:38:40.123Z', 125.65, 'red tuna', NUll, NUll);
INSERT INTO test_table(id, owner_id, transaction_date, amount, description, document, doc_lines) VALUES('id-2', 'owner-1', '2022-02-17T21:30:15.001Z', 200, 'bule marlin', NUll, NUll);
INSERT INTO test_table(id, owner_id, transaction_date, amount, description, document, doc_lines) VALUES('id-3', 'owner-1', '2022-03-5T12:3:10.002Z', 1200, 'big fish catch', NUll, NUll);
INSERT INTO test_table(id, owner_id, transaction_date, amount, description, document, doc_lines) VALUES('id-4', 'owner-2', '2022-05-15T16:22:19.003Z', 900, 'wild sea bass', NUll, NUll);