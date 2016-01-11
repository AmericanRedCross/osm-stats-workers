var fs = require('fs');
var tap = require('tap');
var buildingCountMod = require('../../src/metrics/building_count_mod');
var emptyChangeset = JSON.parse(fs.readFileSync('test/fixtures/null.json'));
var untaggedChangeset = JSON.parse(fs.readFileSync('test/fixtures/untagged.json'));
var threeBuildingChangeset = JSON.parse(fs.readFileSync('test/fixtures/buildings/created_modified.json'));

tap.test('building_count', function (t) {
  // An empty changeset should return 0
  t.equal(buildingCountMod(emptyChangeset), 0, 'empty changeset should return 0');

  // Untagged ways
  t.equal(buildingCountMod(untaggedChangeset), 0, 'untagged changeset should return 0');

  // A created and a modified building should both count
  // towards the building count
  t.equal(buildingCountMod(threeBuildingChangeset), 2, 'one created and two modified buildings should return 2');

  t.end();
});
