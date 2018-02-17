CREATE VIEW changesets_hashtags AS
  SELECT
    changeset_id,
    hashtag_id
  FROM raw_changesets_hashtags;
