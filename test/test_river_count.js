var fs = require('fs');
var tap = require('tap');
var riverCount = require('../src/metrics/river_count');
var changeset = JSON.parse(fs.readFileSync('test/example.json', 'utf8'));

tap.test('test river count', function (t) {
  t.equal(riverCount(changeset), 7);
  t.end();
});
