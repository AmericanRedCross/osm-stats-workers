var fs = require('fs');
var calculateMetrics = require('../src/calculate_metrics.js');
var tap = require('tap');
var country = require('../src/metrics/country');
var roadCount = require('../src/metrics/road_count');
var roadCountMod = require('../src/metrics/road_count_mod');
var buildingCount = require('../src/metrics/building_count');
var buildingCountMod = require('../src/metrics/building_count_mod');
var waterwayCount = require('../src/metrics/river_count');
var poiCount = require('../src/metrics/poi_count');
var roadLength = require('../src/metrics/road_length');
var roadLengthMod = require('../src/metrics/road_length_mod');
var waterwayLength = require('../src/metrics/river_length');
var extentBuffer = require('../src/metrics/geo_extent_buffer');

tap.test('simulator tests', function (test) {
  fs.readdirSync('test/fixtures/simulator/').forEach(function (file, index) {
    var changeset = JSON.parse(fs.readFileSync('test/fixtures/simulator/' + file));
    test.doesNotThrow(() => country(extentBuffer(500)(changeset)), 'calculate country');
    test.doesNotThrow(() => roadCount(changeset), 'calculate road count');
    test.doesNotThrow(() => roadCountMod(changeset), 'calculate road count mod');
    test.doesNotThrow(() => buildingCount(changeset), 'calculate building count');
    test.doesNotThrow(() => buildingCountMod(changeset), 'calculate building count mod');
    test.doesNotThrow(() => waterwayCount(changeset), 'calculate waterway count');
    test.doesNotThrow(() => poiCount(changeset), 'calculate poi count');
    test.doesNotThrow(() => roadLength(changeset), 'calculate road length');
    test.doesNotThrow(() => roadLengthMod(changeset), 'calculate road length mod');
    test.doesNotThrow(() => waterwayLength(changeset), 'calculate waterway length');
    test.doesNotThrow(() => extentBuffer(500)(changeset), 'calculate buffer');
    test.doesNotThrow(() => calculateMetrics(changeset), 'calculating metrics');
  });
  test.end();
});
