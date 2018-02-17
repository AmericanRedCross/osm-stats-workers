CREATE TABLE raw_hashtags (
    id serial,
    hashtag text NOT NULL UNIQUE,
    PRIMARY KEY(id)
);
