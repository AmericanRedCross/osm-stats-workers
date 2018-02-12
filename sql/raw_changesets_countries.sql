CREATE TABLE raw_changesets_countries (
    changeset_id integer NOT NULL,
    country_id integer NOT NULL,
    PRIMARY KEY(changeset_id, country_id)
);
