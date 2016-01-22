var fs = require('fs');
var tap = require('tap');
var country = require('../../src/metrics/country');
var extentBuffer = require('../../src/metrics/geo_extent_buffer');
var changeset = JSON.parse(fs.readFileSync('test/fixtures/example.json', 'utf8'));

tap.test('test country', function (t) {
  t.equal(country(extentBuffer(500)(changeset))[0], 'Mali');
  t.end();
});
