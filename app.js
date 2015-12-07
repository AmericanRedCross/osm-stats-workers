// Scratchpad for testing modularized functions

var fs = require('fs');
var roadLength = require('./src/metrics/road_length');

var changeset = JSON.parse(fs.readFileSync('test/example.json', 'utf8'));

var roadLengthKM = roadLength(changeset);
console.log(roadLengthKM);
