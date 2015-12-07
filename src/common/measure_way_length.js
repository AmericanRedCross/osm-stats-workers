var turf = require('turf');

// Takes list of changeset features, returns total distance of line segments
module.exports = function (features) {
  var length = features
    // Map individual line distances
    .map(function (segment) {
      // Include line segment boilerplate
      var line = {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          // Map nodes to segments
          'coordinates': segment.nodes.map(function (node) {
            return [node.lon, node.lat];
          })
        }
      };
      // Measure distances
      return turf.lineDistance(line, 'kilometers');
    })
    // Sum all line distances
    .reduce(function (a, b) {
      return a + b;
    });
  return length;
};
