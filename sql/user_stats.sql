CREATE TABLE user_stats AS
  SELECT
    user_id,
    name,
    count(raw_changesets.id) changesets,
    sum(road_km_added) road_km_added,
    sum(road_km_modified) road_km_modified,
    sum(waterway_km_added) waterway_km_added,
    sum(waterway_km_modified) waterway_km_modified,
    sum(roads_added) roads_added,
    sum(roads_modified) roads_modified,
    sum(waterways_added) waterways_added,
    sum(waterways_modified) waterways_modified,
    sum(buildings_added) buildings_added,
    sum(buildings_modified) buildings_modified,
    sum(pois_added) pois_added,
    sum(pois_modified) pois_modified,
    sum(CASE
      WHEN position('josm' in lower(editor)) > 0 THEN 1
      ELSE 0
      END) josm_edits,
    (SELECT count(country_id) FROM raw_countries_users where raw_countries_users.user_id = raw_changesets.user_id) AS countries,
    (SELECT count(hashtag_id) FROM raw_hashtags_users where raw_hashtags_users.user_id = raw_changesets.user_id) AS hashtags,
    max(coalesce(closed_at, created_at)) updated_at
  FROM raw_changesets
  JOIN raw_users ON raw_changesets.user_id = raw_users.id
  WHERE user_id IS NOT NULL
  GROUP BY user_id, name;

CREATE UNIQUE INDEX user_stats_user_id ON user_stats(user_id);
CREATE INDEX user_stats_updated_at ON user_stats(updated_at);
