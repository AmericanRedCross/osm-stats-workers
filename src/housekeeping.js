const async = require("async");
const env = require("require-env");
const { Client } = require("pg");

const { NOOP } = require(".");

const client = new Client(env.require("DATABASE_URL"));

module.exports = callback => {
  callback = callback || NOOP;

  client.connect();

  return async.parallel(
    [
      async.apply(
        client.query.bind(client),
        "REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats"
      ),
      async.apply(
        client.query.bind(client),
        "REFRESH MATERIALIZED VIEW CONCURRENTLY hashtag_stats"
      )
    ],
    err => {
      client.end();

      return callback(err);
    }
  );
}
