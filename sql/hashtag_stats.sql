CREATE MATERIALIZED VIEW hashtag_stats AS
  SELECT
    hashtag,
    count(c.id) changesets,
    count(distinct c.user_id) users,
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
    max(coalesce(closed_at, created_at)) updated_at
  FROM raw_changesets_hashtags ch
  JOIN raw_changesets c ON c.id = ch.changeset_id
  JOIN raw_hashtags h ON h.id = ch.hashtag_id
  GROUP BY hashtag;

CREATE UNIQUE INDEX hashtag_stats_hashtag ON hashtag_stats(hashtag);
