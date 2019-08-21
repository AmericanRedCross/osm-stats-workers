-- view with a schema that matches the legacy hashtags table
CREATE TABLE hashtags AS
  SELECT
    id,
    hashtag
  FROM raw_hashtags;
