var fs = require('fs');
var knex = require('./src/common/db_connection_knex');
var bookshelf = require('bookshelf')(knex);
var Promise = require('bluebird');
// require metric extraction workers
var country = require('./src/metrics/country');
var roadCount = require('./src/metrics/road_count');
var buildingCount = require('./src/metrics/building_count');
var waterwayCount = require('./src/metrics/river_count');
var poiCount = require('./src/metrics/poi_count');
var gpstraceCount = require('./src/metrics/trace_count');
var roadLength = require('./src/metrics/road_length');
var waterwayLength = require('./src/metrics/river_length');
var gpstraceLength = require('./src/metrics/trace_length');
var extentBuffer = require('./src/metrics/geo_extent_buffer');
// var extentCvHull = require('./src/metrics/geo_extent_convexhull');
// require models
var db = require('./src/models/models_tmp');
var Changeset = db.Changeset;
var User = db.User;
var Hashtag = db.Hashtag;

// // Cannot seem to get model inserts working as functions
// // See line 71, 89, 89

// function addUser (t) {
//   return new User({
//     id: metrics.user.id,
//     name: metrics.user.name,
//     avatar: metrics.user.avatar,
//     geo_extent: metrics.user.geo_extent,
//     created_at: new Date()
//   })
//   .save(null, {method: 'insert', transacting: t});
// }

// function addChangeset (t) {
//   return new Changeset({
//     id: metrics.id,
//     road_count: metrics.metrics.road_count,
//     building_count: metrics.metrics.building_count,
//     waterway_count: metrics.metrics.waterway_count,
//     poi_count: metrics.metrics.poi_count,
//     gpstrace_count: metrics.metrics.gpstrace_count,
//     road_km: metrics.metrics.road_km,
//     waterway_km: metrics.metrics.waterway_km,
//     gpstrace_km: metrics.metrics.gpstrace_km,
//     editor: metrics.editor,
//     user_id: metrics.user.id,
//     created_at: new Date(metrics.created_at)
//   })
//   .save(null, {method: 'insert', transacting: t});
// }

// function addHashtags (t, hashtags) {
//   return Promise.map(
//     metrics.hashtags, function (name) {
//       return new Hashtag({
//         hashtag: name,
//         created_at: new Date()
//       })
//     .save({}, {method: 'insert', transacting: t});
//     });
// }

function updateDB (metrics) {
  bookshelf.transaction(function (t) {
    return User.where('id', metrics.user.id).fetch()
    .then(function (model) {
      if (!model) {
        // addUser(t)
        return new User({
          id: metrics.user.id,
          name: metrics.user.name,
          avatar: metrics.user.avatar,
          geo_extent: metrics.user.geo_extent,
          created_at: new Date()
        })
        .save(null, {method: 'insert', transacting: t});
      } else {
        console.log('User ' + model.id + ' exists');
        return model;
      }
    })
    .then(function () {
      return Changeset.where('id', metrics.id).fetch()
      .then(function (model) {
        if (!model) {
          // addChangeset(t)
          return new Changeset({
            id: metrics.id,
            road_count: metrics.metrics.road_count,
            building_count: metrics.metrics.building_count,
            waterway_count: metrics.metrics.waterway_count,
            poi_count: metrics.metrics.poi_count,
            gpstrace_count: metrics.metrics.gpstrace_count,
            road_km: metrics.metrics.road_km,
            waterway_km: metrics.metrics.waterway_km,
            gpstrace_km: metrics.metrics.gpstrace_km,
            editor: metrics.editor,
            user_id: metrics.user.id,
            created_at: new Date(metrics.created_at)
          })
        .save(null, {method: 'insert', transacting: t});
        } else {
          throw new Error('Changeset ' + metrics.id + ' exists');
        }
      });
    })
    .tap(function (model) {
      // addHashtags(t, metrics.hashtags)
      return Promise.map(
        metrics.hashtags, function (name) {
          return new Hashtag({
            hashtag: name,
            created_at: new Date()})
        .save({}, {method: 'insert', transacting: t});
        });
    });
  })
.catch(function (err) {
  console.error(err);
});
}

function extractMetrics (srcChangeset) {
  return {
    id: +srcChangeset.metadata.id,
    hashtags: srcChangeset.metadata.comment.split(' '),
    country: country(srcChangeset),
    user: {
      id: +srcChangeset.metadata.uid,
      name: srcChangeset.metadata.user,
      // todo: add avatar lookup
      avatar: '?',
      geo_extent: extentBuffer(srcChangeset, 100) // ,
      // convex hull much faster to calculate, but less meaningful
      // geoExtent: extentCvHull(srcChangeset),
    },
    metrics: {
      road_count: roadCount(srcChangeset),
      building_count: buildingCount(srcChangeset),
      waterway_count: waterwayCount(srcChangeset),
      poi_count: poiCount(srcChangeset),
      road_km: ~~(roadLength(srcChangeset) * 100),
      waterway_km: ~~(waterwayLength(srcChangeset) * 100),
      // todo: add GPS trace lookup; placeholder functions return 0
      gpstrace_count: gpstraceCount('srcGpstraces'),
      gpstrace_km: ~~(gpstraceLength('srcGpstraces') * 100)
    },
    editor: srcChangeset.metadata.created_by,
    created_at: srcChangeset.metadata.created_at
  };
}

var srcChangeset = JSON.parse(
  fs.readFileSync('./test/fixtures/example.json', 'utf8'));

var metrics = extractMetrics(srcChangeset);
updateDB(metrics);
