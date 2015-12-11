var fs = require('fs');
var tap = require('tap');
var roadCount = require('../../src/metrics/road_count');
var empty = JSON.parse(fs.readFileSync('test/fixtures/null.json', 'utf8'));
var oneCreatedWay = JSON.parse(fs.readFileSync('test/fixtures/highways/created_way.json', 'utf8'));
var oneCreatedOneModifedWay = JSON.parse(fs.readFileSync('test/fixtures/highways/created_modified.json', 'utf8'));

tap.test('road_count', function (t) {
  // Empty changeset
  t.equal(roadCount(empty), 0, 'empty changeset should return 0');

  // One created way
  t.equal(roadCount(oneCreatedWay), 1, 'one created way should return 1');

  // One created way
  t.equal(roadCount(oneCreatedOneModifedWay), 2, 'two edited ways should return 2');
  t.end();
});
