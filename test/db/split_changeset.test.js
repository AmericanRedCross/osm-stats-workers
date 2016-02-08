var fs = require('fs');
var tap = require('tap');
var Worker = require('../../');
var R = require('ramda');

var changeset = JSON.parse(fs.readFileSync('test/fixtures/example.json'));
var changeset_split_1 = JSON.parse(fs.readFileSync('test/fixtures/example_split_1.json'));
var changeset_split_2 = JSON.parse(fs.readFileSync('test/fixtures/example_split_2.json'));

tap.test('add changeset split into two files', function (t) {
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

  t.test('sum of two changesets', function (test) {
    worker.addToDB(changeset)
      .then(function () {
        return worker.addToDB(changeset_split_2);
      })
      .then(function () {
        worker.addToDB(changeset_split_1);
      })
      .then(function (result) {
        // Compare that the sum of the splits is the same as the changeset
        return knex('changesets').select()
          .then(function (results) {
            return worker.destroy().then(function () {
              var changeset = results[0];
              var split_changeset = results[1];
              var omit_id = R.omit('id');

              test.same(omit_id(changeset), omit_id(split_changeset), 'comparing changesets');
              test.end();
            });
          });
      })
      .then(function () {
        t.end();
      });
  });
});
