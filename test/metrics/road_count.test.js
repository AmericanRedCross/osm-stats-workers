var fs = require('fs');
var tap = require('tap');
var roadCount = require('../../src/metrics/road_count');
var empty = JSON.parse(fs.readFileSync('test/fixtures/null.json', 'utf8'));
var untagged = JSON.parse(fs.readFileSync('test/fixtures/untagged.json', 'utf8'));
var oneCreatedWay = JSON.parse(fs.readFileSync('test/fixtures/highways/created_way.json', 'utf8'));
var oneCreatedTwoModifedWay = JSON.parse(fs.readFileSync('test/fixtures/highways/created_modified.json', 'utf8'));

tap.test('road_count', function (t) {
  // Empty changeset
  t.equal(roadCount(empty), 0, 'empty changeset should return 0');

  // Untagged changeset
  t.equal(roadCount(untagged), 0, 'untagged changeset should return 0');

  // One created way
  t.equal(roadCount(oneCreatedWay), 1, 'one created way should return 1');

  // One created way
  t.equal(roadCount(oneCreatedTwoModifedWay), 1, 'one created and two modified ways should return 1');
  t.end();
});
