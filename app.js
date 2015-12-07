// Scratchpad for testing modularized functions

var fs = require('fs');
var roadLength = require('./src/metrics/road_length');
var roadCount = require('./src/metrics/road_count');
var riverLength = require('./src/metrics/river_length');
var riverCount = require('./src/metrics/river_count');
var poiCount = require('./src/metrics/poi_count');
var country = require('./src/metrics/country');

var changeset = JSON.parse(fs.readFileSync('test/example.json', 'utf8'));

console.log('road count: ' + roadCount(changeset));
console.log('road length: ' + roadLength(changeset) + 'km');
console.log('river count: ' + riverCount(changeset));
console.log('river length: ' + riverLength(changeset) + 'km');
console.log('poi count: ' + poiCount(changeset));
console.log('country: ' + country(changeset));
