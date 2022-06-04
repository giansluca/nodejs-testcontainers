CREATE TABLE IF NOT EXISTS test_table (
  id                        VARCHAR(36) PRIMARY KEY, 
  owner_id                  VARCHAR(36) NOT NULL, 
  transaction_date          TIMESTAMP, 
  amount                    NUMERIC, 
  description               VARCHAR(512),
  document                  jsonb,
  doc_lines                 jsonb
);
