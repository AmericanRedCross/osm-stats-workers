#!/usr/bin/env node

const async = require("async");
const env = require("require-env");
const { Client } = require("pg");

process.on("unhandledRejection", err => {
  throw err;
});

const client = new Client(env.require("DATABASE_URL"));
client.connect();

async.parallel(
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
    if (err) {
      throw err;
    }

    client.end();
  }
);
