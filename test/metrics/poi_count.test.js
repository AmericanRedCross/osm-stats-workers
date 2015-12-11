var fs = require('fs');
var tap = require('tap');
var poiCount = require('../../src/metrics/poi_count');
var changeset = JSON.parse(fs.readFileSync('test/fixtures/example.json', 'utf8'));

tap.test('test POI count', function (t) {
  t.equal(poiCount(changeset), 0);
  t.end();
});
