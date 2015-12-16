var turf = require('turf');
var gjp = require('geojson-precision');
var nodesToMultipoints = require('../common/nodes_to_multipoint');
var nodesToMlMp = require('../common/ways_to_multiline_multipolygon');

// Takes OSM changeset and buffer distance in meters. Returns
// buffered changeset features as GeoJSON.
module.exports = function (changeset, bufferDistance) {
  var elements = changeset.elements;

  // Filter OSM changeset for attributed lines (waterway and highway),
  // building polygons, and all nodes. Should the nodes be limited
  // to only amenities, as in the case of the count metrics?
  var lines = elements.filter(function (element) {
    return (element.tags &&
           (element.tags.hasOwnProperty('waterway') ||
            element.tags.hasOwnProperty('highway')));
  });
  var buildings = elements.filter(function (element) {
    return (element.tags && element.tags.hasOwnProperty('building'));
  });
  var nodes = elements.filter(function (element) {
    return (element.type && element.type === 'node');
  });

  // Convert OSM changset feature objects to multipart GeoJSON features
  var multiLine = nodesToMlMp(lines, 'MultiLineString');
  var multiPolygon = nodesToMlMp(buildings, 'MultiPolygon');
  var multiPoint = nodesToMultipoints(nodes);

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
