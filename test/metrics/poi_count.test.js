var fs = require('fs');
var tap = require('tap');
var poiCount = require('../../src/metrics/poi_count');
var empty = JSON.parse(fs.readFileSync('test/fixtures/null.json', 'utf8'));
var untagged = JSON.parse(fs.readFileSync('test/fixtures/untagged.json', 'utf8'));
var createdAmenity = JSON.parse(fs.readFileSync('test/fixtures/poi/created_amenity.json', 'utf8'));

tap.test('poi_count', function (t) {
  // Empty changeset
  t.equal(poiCount(empty), 0, 'empty changeset should return 0');

  // Untagged changeset
  t.equal(poiCount(untagged), 0, 'untagged changeset should return 0');

  // Created amenity
  t.equal(poiCount(createdAmenity), 1, 'one created amenity should return 1');

  t.end();
});
