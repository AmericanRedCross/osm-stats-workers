-- view with a schema that matches the legacy users table
CREATE VIEW users AS
  SELECT
    id,
    name,
    null geo_extent,
    buildings_added total_building_count_add,
    buildings_modified total_building_count_mod,
    waterways_added total_waterway_count_add,
    pois_added total_poi_count_add,
    road_km_added total_road_km_add,
    road_km_modified total_road_km_mod,
    waterway_km_added total_waterway_km_add,
    josm_edits total_josm_edit_count,
    0 total_gps_trace_count_add,
    0 total_gps_trace_updated_from_osm,
    roads_added total_road_count_add,
    roads_modified total_road_count_mod,
    0 total_tm_done_count,
    0 total_tm_val_count,
    0 total_tm_inval_count
  FROM raw_users u
  JOIN user_stats us ON us.user_id = u.id;
