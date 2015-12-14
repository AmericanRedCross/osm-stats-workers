var fs = require('fs');
var tap = require('tap');
var riverLength = require('../../src/metrics/river_length');
var empty = JSON.parse(fs.readFileSync('test/fixtures/null.json', 'utf8'));
var untagged = JSON.parse(fs.readFileSync('test/fixtures/untagged.json', 'utf8'));
var createdRiver = JSON.parse(fs.readFileSync('test/fixtures/waterways/created_river.json', 'utf8'));
var createdModifiedRiver = JSON.parse(fs.readFileSync('test/fixtures/waterways/created_modified.json', 'utf8'));

tap.test('river_length', function (t) {
  // Empty
  t.equal(riverLength(empty).toFixed(3), '0.000', 'empty changeset should return 0');

  // Untagged
  t.equal(riverLength(untagged).toFixed(3), '0.000', 'untagged changeset should return 0');

  // Created
  t.equal(riverLength(createdRiver).toFixed(3), '111.230', 'one created river');

  // Created + modified
  t.equal(riverLength(createdRiver).toFixed(3),
          riverLength(createdModifiedRiver).toFixed(3),
          'one created + modified should discard modified');

  t.end();
});
