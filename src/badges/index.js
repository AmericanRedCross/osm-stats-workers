const { Writable } = require("stream");

const async = require("async");
const env = require("require-env");
const { Pool } = require("pg");
const QueryStream = require("pg-query-stream");

const { NOOP } = require("..");
const getBadges = require("./sum_check");
const getDateBasedBadges = require("./date_check_total");
const getSequentialBadges = require("./date_check_sequential");

const query = async (pool, query, params) => {
  const client = await pool.connect();

  try {
    return await client.query(query, params);
  } finally {
    client.release();
  }
};

class AbstractBadgeProcessor extends Writable {
  constructor(pool) {
    super({
      objectMode: true
    });

    this.pool = pool;
  }

  updateBadges(userId, badges, callback) {
    return Promise.all(
      Object.keys(badges)
        .map(x => badges[x])
        .map(x =>
          query(
            this.pool,
            `
INSERT INTO badges_users (user_id, badge_id) VALUES (
  $1, (SELECT id FROM badges WHERE category=$2 AND level=$3)
)
ON CONFLICT DO NOTHING
            `,
            [userId, badge.category, badge.level]
          )
        )
    );
  }
}

class BadgeProcessor extends AbstractBadgeProcessor {
  _write(row, _, callback) {
    // TODO TM badges
    const badges = getBadges({
      buildings: Number(row.buildings_added),
      pois: Number(row.pois_added),
      roadKms: row.road_km_added,
      roadKmMods: row.road_km_modified,
      waterways: row.waterway_km_added,
      josm: Number(row.josm_edits),
      countries: Number(row.countries),
      hashtags: Number(row.hashtags)
    });

    return this.updateBadges(row.user_id, badges, callback);
  }
}

class DateBasedBadgeProcessor extends AbstractBadgeProcessor {
  _write(row, _, callback) {
    const { user_id: userId, timestamps } = row;

    if (userId == null) {
      return callback();
    }

    const badges = Object.assign(
      {},
      getDateBasedBadges(timestamps),
      getSequentialBadges(timestamps)
    );

    return this.updateBadges(userId, badges, callback);
  }
}

module.exports.updateBadges = callback => {
  callback = callback || NOOP;

  const pool = new Pool({
    connectionString: env.require("DATABASE_URL")
  });

  const now = new Date();

  return async.series(
    [
      async.apply(async.parallel, [
        next =>
          pool.connect((err, client, release) => {
            if (err) {
              throw err;
            }

            const done = () => {
              release();

              return next();
            };

            const query = new QueryStream(
              `
SELECT *
FROM user_stats
WHERE updated_at > (
  SELECT
    last_run
  FROM badge_updater_status
)
              `
            );

            client
              .query(query)
              .pipe(new BadgeProcessor(pool).on("finish", done));
          }),
        next =>
          pool.connect((err, client, release) => {
            if (err) {
              throw err;
            }

            const done = () => {
              release();

              return next();
            };

            // fetch data for users w/ changesets updated since the last time badges were updated
            const query = new QueryStream(`
  SELECT
    c.user_id,
    array_agg(DISTINCT date_trunc('day', c.created_at)) timestamps
  FROM raw_changesets c
  JOIN user_stats u USING (user_id)
  WHERE c.created_at IS NOT NULL
    AND u.updated_at > (SELECT last_run FROM badge_updater_status)
  GROUP BY c.user_id
    `);

            client
              .query(query)
              .pipe(new DateBasedBadgeProcessor(pool).on("finish", done));
          })
      ]),
      done =>
        query(pool, "UPDATE badge_updater_status SET last_run = $1", [now])
          .then(() => done())
          .catch(done)
    ],
    async err => {
      try {
        await pool.end();
      } finally {
        return callback(err);
      }
    }
  );
};
