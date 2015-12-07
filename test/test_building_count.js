var fs = require('fs');
var tap = require('tap');
var buildingCount = require('../src/metrics/building_count');
var changeset = JSON.parse(fs.readFileSync('test/example.json', 'utf8'));

tap.test('test building count', function (t) {
  t.equal(buildingCount(changeset), 37);
  t.end();
});
