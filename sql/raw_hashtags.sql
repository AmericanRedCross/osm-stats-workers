CREATE TABLE raw_hashtags (
    id serial,
    hashtag text NOT NULL UNIQUE,
    PRIMARY KEY(id)
);

CREATE UNIQUE INDEX ON raw_hashtags (hashtag);
