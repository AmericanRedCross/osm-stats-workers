const env = require("require-env");
const { Pool } = require("pg");

const QUERIES = [
  "REFRESH MATERIALIZED VIEW CONCURRENTLY hashtag_stats",
  "REFRESH MATERIALIZED VIEW CONCURRENTLY raw_countries_users",
  "REFRESH MATERIALIZED VIEW CONCURRENTLY raw_hashtags_users",
  "REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats"
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
