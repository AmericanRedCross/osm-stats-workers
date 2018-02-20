CREATE MATERIALIZED VIEW raw_hashtags_users AS
  SELECT *,
    rank() OVER (ORDER BY edits DESC) edits_rank,
    rank() OVER (ORDER BY buildings DESC) buildings_rank,
    rank() OVER (ORDER BY road_km DESC) road_km_rank,
    rank() OVER (ORDER BY updated_at DESC) updated_at_rank
  FROM (
    SELECT
      raw_changesets_hashtags.hashtag_id,
      raw_changesets.user_id,
      count(id) changesets,
      sum(buildings_added + buildings_modified + roads_added + roads_modified + waterways_added + waterways_modified + pois_added + pois_modified) edits,
      sum(buildings_added + buildings_modified) buildings,
      sum(road_km_added + road_km_modified) road_km,
      max(coalesce(closed_at, created_at)) updated_at
    FROM raw_changesets
    JOIN raw_changesets_hashtags ON raw_changesets_hashtags.changeset_id = raw_changesets.id
    GROUP BY hashtag_id, user_id
  ) AS _;

CREATE INDEX raw_hashtags_users_hashtag_id ON raw_hashtags_users(hashtag_id);
