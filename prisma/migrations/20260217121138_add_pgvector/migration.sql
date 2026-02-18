CREATE
EXTENSION IF NOT EXISTS vector;

CREATE TABLE "OKRVector"
(
    id        SERIAL PRIMARY KEY,
    title     TEXT NOT NULL,
    embedding VECTOR(3072)
);
