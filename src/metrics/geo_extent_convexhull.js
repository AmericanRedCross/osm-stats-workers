var turf = require('turf');
var waysToSinglepoints = require('../common/ways_to_singlepoints');
var nodesToSinglepoints = require('../common/nodes_to_singlepoints');

// Takes OSM changeset, Returns convex hull of changeset
// features as GeoJSON.
module.exports = function (changeset) {
  var elements = changeset.elements;
  // Filter OSM changeset for attributed ways (waterway, highway,
  // and building), and all nodes. Should the nodes be limited
  // to only amenities, as in the case of the count metrics?
  var nodes = elements.filter(function (element) {
    return (element.type && element.type === 'node');
  });
  var ways = elements.filter(function (element) {
    return (element.tags &&
           (element.tags.hasOwnProperty('waterway') ||
           element.tags.hasOwnProperty('highway') ||
           element.tags.hasOwnProperty('building')));
  });
  // Explode OSM features to points and calculate convex hull
  var convexHull = turf.convex({
    'type': 'FeatureCollection',
    'features': waysToSinglepoints(ways)
      .concat(nodesToSinglepoints(nodes))
  });

  return convexHull;
};
