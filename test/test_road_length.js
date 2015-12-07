var fs = require('fs');
var tap = require('tap');
var roadLength = require('../src/metrics/road_length');
var changeset = JSON.parse(fs.readFileSync('test/example.json', 'utf8'));

tap.test('test road length', function (t) {
  t.equal(roadLength(changeset).toFixed(3), '0.156');
  t.end();
});
