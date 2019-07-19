// for osm-replication-streams on Node < 8
require("babel-polyfill");
require("core-js/features/array/flat");

const _ = require("highland");
const async = require("async");
const env = require("require-env");
var htmlEntities = require("html-entities").AllHtmlEntities;
const OSMParser = require("osm2obj");
const {
  parsers: { AugmentedDiffParser },
  sources: { AugmentedDiffs, Changesets }
} = require("osm-replication-streams");
const { Pool } = require("pg");

const { NOOP } = require(".");
const StatsStream = require("./stats_stream");

const OVERPASS_URL = process.env.OVERPASS_URL || "http://overpass-api.de";

const pool = new Pool({
  connectionString: env.require("DATABASE_URL")
});

pool.on("error", err => {
  console.warn("Unexpected error on idle client", err);
  throw err;
});

const query = (q, params, callback) =>
  pool.connect((err, client, release) => {
    if (typeof params === "function") {
      callback = params;
      params = null;
    }

    callback = callback || NOOP;

    if (err) {
      console.warn(err);
      release();
      return callback(err);
    }

    return client.query(q, params, (err, results) => {
      release();
      return callback(err, results);
    });
  });

const join = (a, b) => {
  if (typeof a === "number" || typeof b === "number") {
    return (a || 0) + (b || 0);
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.from(new Set(a || [].concat(b)));
  }

  throw new Error(`Don't know how to join: '${a}', '${b}'`);
};

const merge = (a, b) =>
  Object.keys(b).reduce(
    (acc, k) => Object.assign({}, acc, { [k]: join(acc[k], b[k]) }),
    a
  );

const summarizer = batch =>
  batch.reduce(
    (acc, { changeset, stats, uid, user }) =>
      Object.assign({}, acc, {
        [changeset]: Object.assign({}, merge(acc[changeset] || {}, stats), {
          uid,
          user
        })
      }),
    {}
  );

const statUpdater = stats => {
  const lastAugmentedDiff = Math.max.apply(
    null,
    Array.from(
      new Set(
        Object.keys(stats).reduce(
          (acc, k) => acc.concat(stats[k].augmentedDiffs),
          []
        )
      )
    )
  );

  console.warn(`Checkpointing augmented diffs @ ${lastAugmentedDiff}.`);

  const queries = Object.keys(stats)
    .map(changeset =>
      [
        [
          `
INSERT INTO raw_changesets AS c (
  id,
  user_id,
  roads_added,
  roads_modified,
  waterways_added,
  waterways_modified,
  buildings_added,
  buildings_modified,
  pois_added,
  pois_modified,
  road_km_added,
  road_km_modified,
  waterway_km_added,
  waterway_km_modified,
  augmented_diffs,
  updated_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, current_timestamp
)
ON CONFLICT (id) DO UPDATE
SET
  roads_added = c.roads_added + $3,
  roads_modified = c.roads_modified + $4,
  waterways_added = c.waterways_added + $5,
  waterways_modified = c.waterways_modified + $6,
  buildings_added = c.buildings_added + $7,
  buildings_modified = c.buildings_modified + $8,
  pois_added = c.pois_added + $9,
  pois_modified = c.pois_modified + $10,
  road_km_added = c.road_km_added + $11,
  road_km_modified = c.road_km_modified + $12,
  waterway_km_added = c.waterway_km_added + $13,
  waterway_km_modified = c.waterway_km_modified + $14,
  augmented_diffs = coalesce(c.augmented_diffs, ARRAY[]::integer[]) || $15,
  updated_at = current_timestamp
WHERE c.id = $1
  AND NOT coalesce(c.augmented_diffs, ARRAY[]::integer[]) && $15
          `,
          [
            Number(changeset),
            Number(stats[changeset].uid),
            stats[changeset].roadsAdded || 0,
            stats[changeset].roadsModified || 0,
            stats[changeset].waterwaysAdded || 0,
            stats[changeset].waterwaysModified || 0,
            stats[changeset].buildingsAdded || 0,
            stats[changeset].buildingsModified || 0,
            stats[changeset].poisAdded || 0,
            stats[changeset].poisModified || 0,
            stats[changeset].roadKmAdded || 0,
            stats[changeset].roadKmModified || 0,
            stats[changeset].waterwayKmAdded || 0,
            stats[changeset].waterwayKmModified || 0,
            stats[changeset].augmentedDiffs
          ]
        ],
        [
          `
INSERT INTO raw_users AS u (
  id,
  name
) VALUES (
  $1, $2
)
ON CONFLICT (id) DO UPDATE
SET
  name = $2
WHERE u.id = $1
      `,
          [Number(stats[changeset].uid), stats[changeset].user]
        ]
      ]
        .concat(
          stats[changeset].countries.map(code => [
            `
INSERT INTO raw_changesets_countries (
  changeset_id,
  country_id
) VALUES (
  $1, (SELECT id FROM raw_countries WHERE code = $2)
)
ON CONFLICT DO NOTHING
          `,
            [Number(changeset), code]
          ])
        )
        .concat([
          [
            `
UPDATE augmented_diff_status
SET id=$1,
  updated_at=current_timestamp
    `,
            [lastAugmentedDiff]
          ]
        ])
    )
    .reduce((acc, a) => acc.concat(a), []);

  return _(push =>
    async.each(
      queries,
      ([q, params], done) => query(q, params, done),
      err => push(err, _.nil)
    )
  );
};

// from https://github.com/openstreetmap/iD/blob/45ffa3b731463bf4eba52519896ad33653def0cd/modules/ui/commit.js
const HASHTAG_REGEX = /(#[^\u2000-\u206F\u2E00-\u2E7F\s\\'!"#$%()*,./:;<=>?@[\]^`{|}~]+)/g;

const extractHashtags = tags => {
  tags.comment = htmlEntities.decode(tags.comment);
  ((tags.comment || "").match(HASHTAG_REGEX) || []).map(
    function(x) {
      x.slice(1).toLowerCase();
    }
 
  );
}
  

const changesetUpdater = changeset => {
  const {
    id,
    created_at: createdAt,
    closed_at: closedAt,
    uid,
    user
  } = changeset;
  let editor = null;
  let hashtags = [];

  if (changeset.tags != null) {
    editor = changeset.tags.created_by;
    hashtags = extractHashtags(changeset.tags);
  }

  const queries = [
    [
      `
INSERT INTO raw_changesets AS c (
  id,
  editor,
  user_id,
  created_at,
  closed_at,
  roads_added,
  roads_modified,
  waterways_added,
  waterways_modified,
  buildings_added,
  buildings_modified,
  pois_added,
  pois_modified,
  road_km_added,
  road_km_modified,
  waterway_km_added,
  waterway_km_modified,
  updated_at
) VALUES (
  $1, $2, $3, $4, $5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, current_timestamp
)
ON CONFLICT (id) DO UPDATE
SET
  editor = $2,
  user_id = $3,
  created_at = $4,
  closed_at = $5,
  updated_at = current_timestamp
WHERE c.id = $1
      `,
      [id, editor, uid, createdAt, closedAt]
    ],
    [
      `
INSERT INTO raw_users AS u (
  id,
  name
) VALUES (
  $1, $2
)
ON CONFLICT (id) DO UPDATE
SET
  name = $2
WHERE u.id = $1
      `,
      [uid, user]
    ]
  ];

  return _(push => {
    async.series(
      [
        async.apply(async.each, queries, ([q, params], done) =>
          query(q, params, done)
        ),
        async.apply(async.each, hashtags, (hashtag, done) =>
          async.waterfall(
            [
              async.apply(
                // https://stackoverflow.com/questions/34708509/how-to-use-returning-with-on-conflict-in-postgresql
                query,
                `
WITH input_rows("hashtag") AS (
  VALUES ($1)
),
ins AS (
  INSERT INTO raw_hashtags AS h (hashtag)
  VALUES ($1)
  ON CONFLICT DO NOTHING
  RETURNING id
)
SELECT id
FROM ins
UNION ALL
SELECT id
FROM input_rows
JOIN raw_hashtags USING(hashtag)
                `,
                [hashtag]
              ),
              (result, fin) => {
                const { id: hashtagId } = result.rows[0];

                return query(
                  `
INSERT INTO raw_changesets_hashtags (
  changeset_id,
  hashtag_id
) VALUES ($1, $2)
ON CONFLICT DO NOTHING
                  `,
                  [id, hashtagId],
                  fin
                );
              }
            ],
            done
          )
        )
      ],
      err => push(err, _.nil)
    );
  });
};

const getInitialAugmentedDiffSequenceNumber = callback =>
  query("SELECT id FROM augmented_diff_status", (err, results) => {
    if (err) {
      return callback(err);
    }

    return callback(null, results.rows[0].id);
  });

const checkpointChangesets = sequenceNumber => {
  console.warn(`Checkpointing changesets @ ${sequenceNumber}.`);

  query(
    `
UPDATE changesets_status
SET id=$1,
  updated_at=current_timestamp
  `,
    [Number(sequenceNumber)],
    err => {
      if (err) {
        console.warn(err.stack);
      }
    }
  );
};

const getInitialChangesetSequenceNumber = callback =>
  query("SELECT id FROM changesets_status", (err, results) => {
    if (err) {
      return callback(err);
    }

    return callback(null, results.rows[0].id);
  });

module.exports = (options, callback) => {
  const opts = Object.assign(
    {},
    {
      delay: 15e3,
      infinite: true
    },
    options
  );

  callback = callback || NOOP;

  return async.parallel(
    {
      initialAugmentedDiffSequenceNumber: getInitialAugmentedDiffSequenceNumber,
      initialChangesetSequenceNumber: getInitialChangesetSequenceNumber
    },
    (
      err,
      { initialAugmentedDiffSequenceNumber, initialChangesetSequenceNumber }
    ) => {
      if (err) {
        return callback(err);
      }

      return async.parallel(
        [
          done =>
            _(
              AugmentedDiffs({
                baseURL: OVERPASS_URL,
                initialSequence: initialAugmentedDiffSequenceNumber + 1,
                infinite: opts.infinite,
                delay: opts.delay
              })
                .pipe(new AugmentedDiffParser().on("error", console.warn))
                .pipe(new StatsStream())
            )
              // batch by sequence
              .through(s => {
                let batched = [];
                let sequence = null;

                return s.consume((err, x, push, next) => {
                  if (err) {
                    push(err);
                    return next();
                  }

                  if (x === _.nil) {
                    // end of the stream; flush
                    if (batched.length > 0) {
                      push(null, batched);
                    }

                    return push(null, _.nil);
                  }

                  let activeSequence = sequence;

                  if (x.stats != null) {
                    [activeSequence] = x.stats.augmentedDiffs;
                  }

                  if (x.type === "Marker" || sequence !== activeSequence) {
                    // new sequence; flush previous
                    if (batched.length > 0) {
                      push(null, batched);
                    }

                    // reset batch
                    if (x.type !== "Marker") {
                      batched = [x];
                    } else {
                      batched = [];
                    }
                    sequence = activeSequence;

                    return next();
                  }

                  // add this item to the batch
                  batched.push(x);

                  return next();
                });
              })
              .map(summarizer)
              .flatMap(statUpdater)
              .done(() => done),
          done =>
            _(
              Changesets({
                initialSequence: initialChangesetSequenceNumber,
                infinite: opts.infinite,
                // TODO checkpoint when a sequence has been fully processed not just seen
                checkpoint: checkpointChangesets
              }).pipe(
                new OSMParser({
                  coerceIds: true
                })
              )
            )
              .flatMap(changesetUpdater)
              .done(() => done)
        ],
        callback
      );
    }
  );
};
