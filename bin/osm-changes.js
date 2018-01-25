#!/usr/bin/env node
// for osm-replication-streams on Node < 8
require("babel-polyfill");
// to silence EPIPE errors when piping to processes that close the stream ahead
// of time
require("epipebomb")();

const _ = require("highland");
const async = require("async");
const env = require("require-env");
const OSMParser = require("osm2obj");
const {
  parsers: { AugmentedDiffParser },
  sources: { AugmentedDiffs, Changesets }
} = require("osm-replication-streams");
const { Client } = require("pg");

const StatsStream = require("../src/stats_stream");

process.on("unhandledRejection", err => {
  throw err;
});

const client = new Client(env.require("DATABASE_URL"));
client.connect();

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
    (acc, { changeset, stats }) =>
      Object.assign({}, acc, {
        [changeset]: merge(acc[changeset] || {}, stats)
      }),
    {}
  );

const statUpdater = stats => {
  const queries = Object.keys(stats)
    .map(changeset =>
      [
        [
          `
INSERT INTO changesets2 AS c (
  id,
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
  waterway_km_modified
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
)
ON CONFLICT (id) DO UPDATE
SET
  roads_added = c.roads_added + $2,
  roads_modified = c.roads_modified + $3,
  waterways_added = c.waterways_added + $4,
  waterways_modified = c.waterways_modified + $5,
  buildings_added = c.buildings_added + $6,
  buildings_modified = c.buildings_modified + $7,
  pois_added = c.pois_added + $8,
  pois_modified = c.pois_modified + $9,
  road_km_added = c.road_km_added + $10,
  road_km_modified = c.road_km_modified + $11,
  waterway_km_added = c.waterway_km_added + $12,
  waterway_km_modified = c.waterway_km_modified + $13
WHERE c.id = $1
          `,
          [
            Number(changeset),
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
            stats[changeset].waterwayKmModified || 0
          ]
        ]
      ].concat(
        stats[changeset].countries.map(code => [
          `
INSERT INTO changesets_countries2 (
  changeset_id,
  country_id
) VALUES (
  $1, (SELECT id FROM countries WHERE code = $2)
)
ON CONFLICT DO NOTHING
          `,
          [Number(changeset), code]
        ])
      )
    )
    .reduce((acc, a) => acc.concat(a), []);

  return _(push =>
    async.each(
      queries,
      ([q, params], done) => client.query(q, params, done),
      err => push(err, _.nil)
    )
  );
};

// from https://github.com/openstreetmap/iD/blob/45ffa3b731463bf4eba52519896ad33653def0cd/modules/ui/commit.js
const HASHTAG_REGEX = /(#[^\u2000-\u206F\u2E00-\u2E7F\s\\'!"#$%()*,./:;<=>?@[\]^`{|}~]+)/g;

const extractHashtags = tags =>
  ((tags.comment || "").match(HASHTAG_REGEX) || []).map(x =>
    x.slice(1).toLowerCase()
  );

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
INSERT INTO changesets2 AS c (
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
  waterway_km_modified
) VALUES (
  $1, $2, $3, $4, $5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
)
ON CONFLICT (id) DO UPDATE
SET
  editor = $2,
  user_id = $3,
  created_at = $4,
  closed_at = $5
WHERE c.id = $1
      `,
      [id, editor, uid, createdAt, closedAt]
    ],
    [
      `
INSERT INTO users2 AS u (
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
          client.query(q, params, done)
        ),
        async.apply(async.each, hashtags, (hashtag, done) =>
          async.waterfall(
            [
              async.apply(
                // https://stackoverflow.com/questions/34708509/how-to-use-returning-with-on-conflict-in-postgresql
                client.query.bind(client),
                `
WITH input_rows("hashtag") AS (
  VALUES ($1)
),
ins AS (
  INSERT INTO hashtags2 AS h (hashtag)
  VALUES ($1)
  ON CONFLICT DO NOTHING
  RETURNING id
)
SELECT id
FROM ins
UNION ALL
SELECT id
FROM input_rows
JOIN hashtags2 USING(hashtag)
                `,
                [hashtag]
              ),
              (result, fin) => {
                const { id: hashtagId } = result.rows[0];

                return client.query(
                  `
INSERT INTO changesets_hashtags2 (
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

const checkpointAugmentedDiffs = sequenceNumber => {
  console.warn(`Augmented diff ${sequenceNumber} fetched.`);

  client.query(
    `
UPDATE augmented_diff_status
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

const getInitialAugmentedDiffSequenceNumber = callback =>
  client.query("SELECT id FROM augmented_diff_status", (err, results) => {
    if (err) {
      return callback(err);
    }

    return callback(null, results.rows[0].id);
  });

const checkpointChangesets = sequenceNumber => {
  console.warn(`Changeset ${sequenceNumber} fetched.`);

  client.query(
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
  client.query("SELECT id FROM changesets_status", (err, results) => {
    if (err) {
      return callback(err);
    }

    return callback(null, results.rows[0].id);
  });

async.parallel(
  {
    initialAugmentedDiffSequenceNumber: getInitialAugmentedDiffSequenceNumber,
    initialChangesetSequenceNumber: getInitialChangesetSequenceNumber
  },
  (
    err,
    { initialAugmentedDiffSequenceNumber, initialChangesetSequenceNumber }
  ) => {
    if (err) {
      throw err;
    }

    const adiffs = AugmentedDiffs({
      initialSequence: initialAugmentedDiffSequenceNumber,
      infinite: true,
      // TODO checkpoint when a sequence has been fully processed not just seen
      checkpoint: checkpointAugmentedDiffs,
      delay: 15e3
    });

    _(
      adiffs
        .pipe(new AugmentedDiffParser().on("error", console.warn))
        .pipe(new StatsStream())
    )
      .batchWithTimeOrCount(100, 1000)
      .map(summarizer)
      .flatMap(statUpdater)
      .done(() => client.end());

    const changesets = Changesets({
      initialSequence: initialChangesetSequenceNumber,
      infinite: true,
      // TODO checkpoint when a sequence has been fully processed not just seen
      checkpoint: checkpointChangesets
    });

    _(
      changesets.pipe(
        new OSMParser({
          coerceIds: true
        })
      )
    )
      .flatMap(changesetUpdater)
      .done(() => client.end());
  }
);
