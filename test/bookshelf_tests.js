// Not formal tests, per se. Just a scratchpad for experimenting with Bookshelf.js

var fs = require('fs');
var db = require('../src/db/models.js');

var roadCount = require('../src/metrics/road_count');
var buildingCount = require('../src/metrics/building_count');
var waterwayCount = require('../src/metrics/river_count');
var poiCount = require('../src/metrics/poi_count');
var roadLength = require('../src/metrics/road_length');
var waterwayLength = require('../src/metrics/river_length');

var changeset = JSON.parse(fs.readFileSync('./example.json', 'utf8'));
console.log(changeset)
var User = db.User;
var Changeset = db.Changeset;

function addUser (id, name) {
  User.where('id', id).fetch().then(function (users) {
    if (!users) {
      new User(
        {
          id: id,
          name: name
        })
      .save(null, {method: 'insert'});
    }
  }).catch(function (err) {
    console.error(err);
  });
}

function addChangeset (changeset) {
  var id = changeset.metadata.id;
  Changeset.where('id', id).fetch().then(function (changesets) {
    if (!changesets) {
      new Changeset(
        {
          id: id,
          road_count: roadCount(changeset),
          building_count: buildingCount(changeset),
          waterway_count: waterwayCount(changeset),
          poi_count: poiCount(changeset),
          gpstrace_count: 0,
          road_km: ~~(roadLength(changeset) * 100),
          waterway_km: ~~(waterwayLength(changeset) * 100),
          gpstrace_km: ~~(0 * 100),
          editor: changeset.metadata.created_by,
          user_id: changeset.metadata.uid,
          created_at: changeset.metadata.created_at
        })
      .save(null, {method: 'insert'});
    }
  }).catch(function (err) {
    console.error(err);
  });
}

function addFullChangeset (changeset) {
  addUser(changeset.metadata.uid, changeset.metadata.user);
  addChangeset(changeset);
}

addFullChangeset(changeset);
