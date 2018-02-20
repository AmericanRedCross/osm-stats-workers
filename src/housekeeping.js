const async = require("async");
const env = require("require-env");
const { Pool } = require("pg");

const { NOOP } = require(".");

const pool = new Pool({
  connectionString: env.require("DATABASE_URL")
});

module.exports = callback => {
  callback = callback || NOOP;

  return pool.connect((err, client, release) => {
    if (err) {
      release();
      return callback(err);
    }

    return async.parallel(
      [
        async.apply(
          client.query.bind(client),
          "REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats"
        ),
        async.apply(
          client.query.bind(client),
          "REFRESH MATERIALIZED VIEW CONCURRENTLY hashtag_stats"
        ),
        async.apply(
          client.query.bind(client),
          "REFRESH MATERIALIZED VIEW CONCURRENTLY raw_hashtags_users"
        )
      ],
      err => {
        release();

        return callback(err);
      }
    );
  })
}
