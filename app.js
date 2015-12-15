// Not formal tests, per se. Just a scratchpad for experimenting with Bookshelf.js

var fs = require('fs');
var roadCount = require('./src/metrics/road_count');
var buildingCount = require('./src/metrics/building_count');
var waterwayCount = require('./src/metrics/river_count');
var poiCount = require('./src/metrics/poi_count');
var roadLength = require('./src/metrics/road_length');
var waterwayLength = require('./src/metrics/river_length');

var srcChangeset = JSON.parse(
  fs.readFileSync('./test/example.json', 'utf8'));

// Example single table update. Ultimately, each table will need
// to be checked and updated in order.
var Changeset = require('./src/models/Changeset');
function addChangeset (srcChangeset) {
  var id = srcChangeset.metadata.id;
  Changeset.where('id', id).fetch().then(function (dbChangeset) {
    if (!dbChangeset) {
      new Changeset(
        {
          id: id,
          road_count: roadCount(srcChangeset),
          building_count: buildingCount(srcChangeset),
          waterway_count: waterwayCount(srcChangeset),
          poi_count: poiCount(srcChangeset),
          gpstrace_count: 0,
          road_km: ~~(roadLength(srcChangeset) * 100),
          waterway_km: ~~(waterwayLength(srcChangeset) * 100),
          gpstrace_km: ~~(0 * 100),
          editor: srcChangeset.metadata.created_by,
          user_id: srcChangeset.metadata.uid,
          created_at: srcChangeset.metadata.created_at
        })
      .save(null, {method: 'insert'});
    } else {
      console.log('Changeset ' + id + ' exists');
    }
  }).catch(function (err) {
    console.error(err);
  });
}

addChangeset(srcChangeset);

