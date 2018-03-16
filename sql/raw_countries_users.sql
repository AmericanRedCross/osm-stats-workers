CREATE MATERIALIZED VIEW raw_countries_users AS
  SELECT
    country_id,
    user_id,
    count(id) changesets
  FROM raw_changesets_countries
  JOIN raw_changesets ON raw_changesets.id = raw_changesets_countries.changeset_id
  GROUP BY country_id, user_id;

CREATE INDEX raw_countries_users_user_id ON raw_countries_users(country_id);
