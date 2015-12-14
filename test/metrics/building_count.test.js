var fs = require('fs');
var tap = require('tap');
var buildingCount = require('../../src/metrics/building_count');
var emptyChangeset = JSON.parse(fs.readFileSync('test/fixtures/null.json'));
var untaggedChangeset = JSON.parse(fs.readFileSync('test/fixtures/untagged.json'));
var twoBuildingChangeset = JSON.parse(fs.readFileSync('test/fixtures/buildings/created_modified.json'));

tap.test('building_count', function (t) {
  // An empty changeset should return 0
  t.equal(buildingCount(emptyChangeset), 0, 'empty changeset should return 0');

  // Untagged ways
  t.equal(buildingCount(untaggedChangeset), 0, 'untagged changeset should return 0');

  // A created and a modified building should both count
  // towards the building count
  t.equal(buildingCount(twoBuildingChangeset), 2, 'a created and modified building should return 2');

  t.end();
});
