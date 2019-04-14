DROP TABLE IF EXISTS unigram;
CREATE TABLE unigram ( 
    word      TEXT,
    frequency INTEGER 
);
DROP TABLE IF EXISTS bigram;
CREATE TABLE bigram ( 
    context   TEXT,
    word      TEXT,
    frequency INTEGER 
);
DROP TABLE IF EXISTS trigram;
CREATE TABLE trigram ( 
    context_1 TEXT,
    context_2 TEXT,
    word      TEXT,
    frequency INTEGER 
);
