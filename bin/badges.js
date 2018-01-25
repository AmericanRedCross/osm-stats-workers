#!/usr/bin/env node

const { Writable } = require("stream");

const async = require("async");
const env = require("require-env");
const { Pool } = require("pg");
const QueryStream = require("pg-query-stream");

const getBadges = require("../src/badges/sum_check");

process.on("unhandledRejection", err => {
  throw err;
});

const pool = new Pool({
  connectionString: env.require("DATABASE_URL")
});

pool.on("error", err => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

class BadgeProcessor extends Writable {
  constructor(pool) {
    super({
      objectMode: true
    });

    this.pool = pool;
  }

  _write(row, _, callback) {
    // TODO TM badges
    const badges = getBadges({
      buildings: Number(row.buildings_added),
      pois: Number(row.pois_added),
      roadKms: row.road_km_added,
      roadKmMods: row.road_km_modified,
      waterways: row.waterway_km_added,
      josm: Number(row.josm_edits)
    });

    return this.pool.connect((err, client, release) => {
      if (err) {
        console.warn(err);
        release();
        return callback(err);
      }

      return async.each(
        Object.keys(badges).map(x => badges[x]),
        (badge, next) =>
          client.query(
            `
  INSERT INTO badges_users2 (user_id, badge_id) VALUES (
  $1, (SELECT id FROM badges2 WHERE category=$2 AND level=$3)
  )
  ON CONFLICT DO NOTHING
      `,
            [row.user_id, badge.category, badge.level],
            next
          ),
        err => {
          if (err) {
            console.warn(err);
          }

          release();
          return callback();
        }
      );
    });
  }
}

// TODO date-based badges
pool.connect((err, client, done) => {
  // TODO fetch users updated since the last time badges were updated
  const query = new QueryStream("SELECT * FROM user_stats");

  client.query(query).pipe(new BadgeProcessor(pool).on("finish", done));
});
