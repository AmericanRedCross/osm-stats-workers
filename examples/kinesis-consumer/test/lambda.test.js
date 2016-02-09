var tap = require('tap');
var fs = require('fs');
var event = JSON.parse(fs.readFileSync('event.json'));
var knex = require('../../../src/common/bookshelf_init.js').knex;
var lambda = require('../').handler;

function runHandler(handler, event) {
  var context = {
    succeed: function (result) {
      console.log('succeed: ' + JSON.stringify(result));
      return true;
    },
    fail: function (error) {
      console.error('fail: ' + error);
      return false;
    },
    done: function () {
      return true;
    }
  };
  return handler(event, context);
}

tap.test('lambda integration', function (t) {
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

  t.test('running', function (test) {
    return runHandler(lambda, event).then(function (result) {
      test.ok(result, 'successful run');
      test.end();
    })
    .then(function () {
      t.end();
    });
  });
});
