var fs = require('fs');
var tap = require('tap');
var Worker = require('../../');

var changeset = JSON.parse(fs.readFileSync('test/fixtures/example.json'));

tap.test('add to db', function (t) {
  var worker = new Worker();
  var knex = worker.bookshelf.knex;
  t.test('setup', function (test) {
    knex.migrate.latest().then(function () {
      return knex.seed.run();
    })
    .then(function () {
      test.end();
    })
    .catch(function () {
      test.bailout();
    });
  });

  t.test('adding', function (test) {
    return worker.addToDB(changeset).then(function (result) {
      t.ok(result, 'added to db');
      t.end();
    });
  });
  t.tearDown(function () {
    worker.destroy();
  });
});
