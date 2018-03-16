const async = require("async");
const env = require("require-env");
const { Pool } = require("pg");

const { NOOP } = require(".");

const pool = new Pool({
  connectionString: env.require("DATABASE_URL")
});

const query = (query, callback) => {
  return pool.connect((err, client, release) => {
    if (err) {
      release();
      return callback(err);
    }

    return client.query(query, err => {
      release();

      return callback(err);
    });
  });
};

module.exports = callback => {
  callback = callback || NOOP;

  return async.parallel(
    [
      async.apply(
        query,
        "REFRESH MATERIALIZED VIEW CONCURRENTLY hashtag_stats"
      ),
      async.apply(
        query,
        "REFRESH MATERIALIZED VIEW CONCURRENTLY raw_countries_users"
      ),
      async.apply(
        query,
        "REFRESH MATERIALIZED VIEW CONCURRENTLY raw_hashtags_users"
      ),
      async.apply(query, "REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats")
    ],
    async err => {
      await pool.end();

      return callback(err);
    }
  );
};
