var fs = require('fs');
var tap = require('tap');
var buildingCount = require('../../src/metrics/building_count');
var emptyChangeset = JSON.parse(fs.readFileSync('test/fixtures/null.json'));
var untaggedChangeset = JSON.parse(fs.readFileSync('test/fixtures/untagged.json'));
var threeBuildingChangeset = JSON.parse(fs.readFileSync('test/fixtures/buildings/created_modified.json'));

tap.test('building_count', function (t) {
  // An empty changeset should return 0
  t.equal(buildingCount(emptyChangeset), 0, 'empty changeset should return 0');

  // Untagged ways
  t.equal(buildingCount(untaggedChangeset), 0, 'untagged changeset should return 0');

  // Only created buildings should contribute to the count
  t.equal(buildingCount(threeBuildingChangeset), 1, 'one created and two modified buildings should return 1');

  t.end();
});
