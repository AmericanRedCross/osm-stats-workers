const env = require("require-env");
const { Pool } = require("pg");

const QUERIES = [
  `INSERT INTO hashtag_stats 
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
    GROUP BY hashtag;`,
  `INSERT INTO raw_countries_users AS
    SELECT
      country_id,
      user_id,
      count(id) changesets
    FROM raw_changesets_countries
    JOIN raw_changesets ON raw_changesets.id = raw_changesets_countries.changeset_id
    GROUP BY country_id, user_id;`,
  `INSERT INTO raw_hashtags_users AS
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
        sum(roads_added + roads_modified) roads,
        sum(road_km_added + road_km_modified) road_km,
        max(coalesce(closed_at, created_at)) updated_at
      FROM raw_changesets
      JOIN raw_changesets_hashtags ON raw_changesets_hashtags.changeset_id = raw_changesets.id
      GROUP BY hashtag_id, user_id
    ) AS _;`,
  `INSERT INTO user_stats AS
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
    GROUP BY user_id, name;`
];

const query = async (pool, query) => {
  const client = await pool.connect();

  try {
    return await client.query(query);
  } finally {
    client.release();
  }
};

module.exports = async () => {
  const pool = new Pool({
    connectionString: env.require("DATABASE_URL")
  });

  pool.on("error", err => {
    console.warn("Unexpected error on idle client", err);
    throw err;
  });

  try {
    await Promise.all(
      QUERIES.map(async q => {
        const check = `select count(pid) from pg_stat_activity where query ilike '${q}%' and state = 'active'`;
        const { count } = (await query(pool, check)).rows[0];

        if (Number(count) === 0) {
          return query(pool, q);
        }
      })
    );
  } finally {
    await pool.end();
  }
};
