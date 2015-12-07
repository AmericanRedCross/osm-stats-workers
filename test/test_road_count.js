var fs = require('fs');
var tap = require('tap');
var roadCount = require('../src/metrics/road_count');
var changeset = JSON.parse(fs.readFileSync('test/example.json', 'utf8'));

tap.test('test road count', function (t) {
  t.equal(roadCount(changeset), 6);
  t.end();
});
