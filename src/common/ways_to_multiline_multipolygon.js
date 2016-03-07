// Takes OSM way array and outputs GeoJSON type string (either
// MultiPolygon or MultiLineString). Returns multipart GeoJSON
// feature of requested type.
module.exports = function (features, type) {
  var array;
  // There should be a less verbose way to wrap polygons in an
  // extra array as compared to linestrings, I would think...
  if (type === 'MultiPolygon') {
    array = features
      .map(function (segment) {
        return [
          segment.nodes.map(function (node) {
            return [Number(node.lon), Number(node.lat)];
          })
        ];
      });
  } else {
    array = features
      .map(function (segment) {
        return segment.nodes.map(function (node) {
          return [Number(node.lon), Number(node.lat)];
        });
      });
  }
  return {
    'type': 'Feature',
    'geometry': {
      'type': type,
      'coordinates': array
    },
    'properties': {}
  };
};
