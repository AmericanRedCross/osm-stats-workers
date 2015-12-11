// Takes OSM node array and returns an array of SinglePoint GeoJSON features.
module.exports = function (features) {
  return features.map(function (point) {
    return {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [point.lon, point.lat]
      },
      'properties': {}
    };
  });
};
