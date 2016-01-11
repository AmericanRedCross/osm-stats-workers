var fs = require('fs');
var tap = require('tap');
var roadCountMod = require('../../src/metrics/road_count_mod');
var empty = JSON.parse(fs.readFileSync('test/fixtures/null.json', 'utf8'));
var untagged = JSON.parse(fs.readFileSync('test/fixtures/untagged.json', 'utf8'));
var oneCreatedWay = JSON.parse(fs.readFileSync('test/fixtures/highways/created_way.json', 'utf8'));
var oneCreatedTwoModifedWay = JSON.parse(fs.readFileSync('test/fixtures/highways/created_modified.json', 'utf8'));

tap.test('road_count', function (t) {
  // Empty changeset
  t.equal(roadCountMod(empty), 0, 'empty changeset should return 0');

  // Untagged changeset
  t.equal(roadCountMod(untagged), 0, 'untagged changeset should return 0');

  // One created way
  t.equal(roadCountMod(oneCreatedWay), 0, 'one created way should return 0');

  // One created way
  t.equal(roadCountMod(oneCreatedTwoModifedWay), 2, 'one created two modified ways should return 2');
  t.end();
});
