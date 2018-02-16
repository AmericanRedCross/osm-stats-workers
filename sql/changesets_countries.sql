CREATE VIEW changesets_countries AS
  SELECT
    changeset_id,
    country_id
  FROM raw_changesets_countries;
