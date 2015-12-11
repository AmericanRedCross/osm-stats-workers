var fs = require('fs');
var tap = require('tap');
var buildingCount = require('../../src/metrics/building_count');
var emptyChangeset = JSON.parse(fs.readFileSync('test/fixtures/null.json'));
var twoBuildingChangeset = JSON.parse(fs.readFileSync('test/fixtures/buildings/2.json'));

tap.test('test empty changeset', function (t) {
  t.equal(buildingCount(emptyChangeset), 0);
  t.end();
});

tap.test('test building count', function (t) {
  t.equal(buildingCount(twoBuildingChangeset), 2);
  t.end();
});
