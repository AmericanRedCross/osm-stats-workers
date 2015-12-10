var turf = require('turf');
var gjp = require('geojson-precision');
var createMultipoint = require('../common/create_multipoint');
var createMultiway = require('../common/create_multiway');

// Takes OSM changeset and buffer distance in meters. Returns
// buffered changeset features as GeoJSON.
module.exports = function makeUserExtent (changeset, bufferDistance) {
  var elements = changeset.elements;

  // Filter OSM changesets for attributed lines, polygons, and points
  var lineEdits = elements.filter(function (element) {
    return element.tags.hasOwnProperty('waterway') ||
           element.tags.hasOwnProperty('highway');
  });
  var buildingEdits = elements.filter(function (element) {
    return element.tags.hasOwnProperty('building');
  });
  // Removing amenity requirement to target unattributed test data, for now
  var poiEdits = elements.filter(function (element) {
    return element.type === 'node'; // &&
    // element.tags.hasOwnProperty('amenity');
  });

  // Convert OSM changset feature objects to multipart GeoJSON features
  var multiLine = createMultiway(lineEdits, 'MultiLineString');
  var multiPolygon = createMultiway(buildingEdits, 'MultiPolygon');
  var multiPoint = createMultipoint(poiEdits);

  // There appears to be a bug in turf.buffer which prevents it from
  // processing a feature collection containing points and polgons. Specifically,
  // it will unnsuccessfully attempt a union of the two types.
  // The workaround is to buffer each type individually and merge the polygons...
  // Buffer and merge features
  var merged = turf.merge({
    'type': 'FeatureCollection',
    'features': [
      turf.buffer(multiLine, bufferDistance, 'meters').features[0],
      turf.buffer(multiPolygon, bufferDistance, 'meters').features[0],
      turf.buffer(multiPoint, bufferDistance, 'meters').features[0]
    ]
  });

  // Return merged dataset with reduced geographic precision
  return gjp.parse(merged, 6);
};
