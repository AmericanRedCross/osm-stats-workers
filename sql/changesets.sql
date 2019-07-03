CREATE TABLE changesets AS
  SELECT
    id,
    roads_added road_count_add,
    roads_modified road_count_mod,
    buildings_added building_count_add,
    buildings_modified building_count_mod,
    waterways_added waterway_count_add,
    pois_added poi_count_add,
    0 gpstrace_count_add,
    road_km_added road_km_add,
    road_km_modified road_km_mod,
    waterway_km_added waterway_km_add,
    0 gpstrace_km_add,
    editor,
    user_id,
    created_at
  FROM raw_changesets;