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
      sum(pois_modified) josm_edits, 
      max(coalesce(closed_at, created_at))  
    FROM raw_changesets_hashtags ch
    JOIN raw_changesets c ON c.id = ch.changeset_id
    JOIN raw_hashtags h ON h.id = ch.hashtag_id
    GROUP BY hashtag
    ON CONFLICT do update;`
  
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
