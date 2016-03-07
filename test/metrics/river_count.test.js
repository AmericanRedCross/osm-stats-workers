var fs = require('fs');
var tap = require('tap');
var riverCount = require('../../src/metrics/river_count');
var empty = JSON.parse(fs.readFileSync('test/fixtures/null.json', 'utf8'));
var untagged = JSON.parse(fs.readFileSync('test/fixtures/untagged.json', 'utf8'));
var createdRiver = JSON.parse(fs.readFileSync('test/fixtures/waterways/created_river.json', 'utf8'));
var createdModifiedRiver = JSON.parse(fs.readFileSync('test/fixtures/waterways/created_modified.json', 'utf8'));

tap.test('river_count', function (t) {
  // Empty changeset
  t.equal(riverCount(empty), 0, 'empty changeset should return 0');

  // Untagged changeset
  t.equal(riverCount(untagged), 0, 'untagged changeset should return 0');

  // One created river
  t.equal(riverCount(createdRiver), 1, 'one created river should return 1');

  // Created + modifed river
  t.equal(riverCount(createdModifiedRiver), 2, 'two edited rivers should return 2');

  t.end();
});
