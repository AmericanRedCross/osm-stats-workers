var tap = require('tap');
var User = require('../../src/models/User');
var Worker = require('../../');
var fs = require('fs');

var changeset = JSON.parse(fs.readFileSync('test/fixtures/example.json'));

tap.test('test gpsTraces', function (t) {
  var worker = new Worker();

  var knex = worker.bookshelf.knex;
  t.test('setup', function (test) {
    knex.migrate.rollback().then(function () {
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
  });

  t.test('count not null', function (test) {
    worker.addToDB(changeset)
    .then(function () {
      return worker.destroy().then(function () {
        return new User({id: 72349}).getGpsTraceCount();
      });
    })
    .then(function (count) {
      test.ok(count);
      test.end();
    })
    .then(function () {
      t.end();
    });
  });
});
