var fs = require('fs');
var tap = require('tap');
var riverLength = require('../src/metrics/river_length');
var changeset = JSON.parse(fs.readFileSync('test/example.json', 'utf8'));

tap.test('test river length', function (t) {
  t.equal(riverLength(changeset).toFixed(3), '238.245');
  t.end();
});
