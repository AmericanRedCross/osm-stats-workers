var fs = require('fs');
var calculateMetrics = require('../src/calculate_metrics.js');
var empty = JSON.parse(fs.readFileSync('test/fixtures/null.json'));
var tap = require('tap');

tap.test('simulator data', function (test) {
  fs.readdirSync('test/fixtures/simulator/').forEach(function (file, index) {
    var changeset = JSON.parse(fs.readFileSync('test/fixtures/simulator/' + file));
    test.doesNotThrow(function () { return calculateMetrics(changeset); }, 'calculating metrics');
  });
  test.end();
});

tap.test('invalid data', function (test) {
  // Files that were encountered in the wild
  fs.readdirSync('test/fixtures/invalid/').forEach(function (file, index) {
    var changeset = JSON.parse(fs.readFileSync('test/fixtures/invalid/' + file));
    test.deepEquals(calculateMetrics(changeset), {}, 'invalid changeset should return {}');
  });
  test.end();
});

tap.test('empty data', function (test) {
  test.deepEquals(calculateMetrics(empty), {}, 'empty changeset should return {}');
  test.end();
});
