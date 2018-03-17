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

  try {
    await Promise.all(QUERIES.map(q => query(pool, q)));
  } finally {
    await pool.end();
  }
};
