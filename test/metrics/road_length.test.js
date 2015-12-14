var fs = require('fs');
var tap = require('tap');
var roadLength = require('../../src/metrics/road_length');
var empty = JSON.parse(fs.readFileSync('test/fixtures/null.json', 'utf8'));
var untagged = JSON.parse(fs.readFileSync('test/fixtures/untagged.json', 'utf8'));
var createdWay = JSON.parse(fs.readFileSync('test/fixtures/highways/created_way.json', 'utf8'));
var createdModifiedWay = JSON.parse(fs.readFileSync('test/fixtures/highways/created_modified.json', 'utf8'));

tap.test('test road length', function (t) {
  // Empty
  t.equal(roadLength(empty).toFixed(3), '0.000', 'empty changeset should return 0');

  // Untagged
  t.equal(roadLength(untagged).toFixed(3), '0.000', 'untagged changeset should return 0');

  // Created
  t.equal(roadLength(createdWay).toFixed(3), '111.230', 'one created way');

  // Created + modified
  t.equal(roadLength(createdWay).toFixed(3),
          roadLength(createdModifiedWay).toFixed(3),
          'one created + modified should discard modified');
  t.end();
});
