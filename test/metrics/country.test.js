var fs = require('fs');
var tap = require('tap');
var country = require('../../src/metrics/country');
var changeset = JSON.parse(fs.readFileSync('test/fixtures/example.json', 'utf8'));

tap.test('test country', function (t) {
  t.equal(country(changeset), 'Mali');
  t.end();
});
