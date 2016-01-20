// WARNING: This test currently modifies the DB!
// test on a separate DB
// TODO: Create new dev DB for these tests

var fs = require('fs');
var tap = require('tap');
var Worker = require('../../');
var worker = new Worker();

var changeset = JSON.parse(fs.readFileSync('test/fixtures/example.json'));

tap.test('add to db', function (test) {
  worker.addToDB(changeset).then(function (results) {
    test.ok(results, 'worker added changeset to the database');
  })
  .catch(function (e) {
    console.log(e);
    test.fail('an error occured', e);
  })
  .finally(function () {
    test.end();
  });
  test.tearDown(function () {
    worker.destroy();
  });
});
