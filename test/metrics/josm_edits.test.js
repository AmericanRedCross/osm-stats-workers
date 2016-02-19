var fs = require('fs');
var tap = require('tap');
var R = require('ramda');
var josmEdits = require('../../src/metrics/josm_edits');
var josmChangeset = JSON.parse(fs.readFileSync('test/fixtures/example.json', 'utf8'));
var nonJosmChangeset = R.clone(josmChangeset);
nonJosmChangeset['metadata']['created_by'] = 'iD';

tap.test('josm_edits', function (t) {
  // Changeset created with JOSM
  t.equal(josmEdits(josmChangeset.metadata.created_by), 1, 'a changeset with JOSM in it\'s created_by field should return 1');

  // Changeset created with iD
  t.equal(josmEdits(nonJosmChangeset.metadata.created_by), 0, 'a changeset without JOSM in it\'s created_by field should return 0');

  t.end();
});
