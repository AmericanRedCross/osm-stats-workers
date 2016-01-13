// WARNING: This test currently modifies the DB!
// test on a separate DB
// TODO: Create new dev DB for these tests

var fs = require('fs');
var tap = require('tap');
var worker = require('../../');

var changeset = JSON.parse(fs.readFileSync('test/fixtures/example.json'));

tap.test('add to db', function (test) {
  worker(changeset).then(function (results) {
    test.ok(results, 'worker added changeset to the database');
    test.end();
  });
});
