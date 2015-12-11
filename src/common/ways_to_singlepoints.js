// Takes OSM way array and outputs GeoJSON an array of SinglePoint
// GeoJSON features for each vertex.
module.exports = function (features) {
  var points = [];
  features.forEach(function (segment) {
    segment.nodes.forEach(function (node) {
      points.push({
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [node.lon, node.lat]
        },
        'properties': {}
      });
    });
  });
  return points;
};
