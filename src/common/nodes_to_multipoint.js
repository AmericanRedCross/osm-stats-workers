// Takes OSM node array and returns a MultiPoint GeoJSON feature.
module.exports = function (features) {
  return {
    'type': 'Feature',
    'geometry': {
      'type': 'MultiPoint',
      'coordinates': features.map(function (point) {
        return [point.lon, point.lat];
      })
    },
    'properties': {}
  };
};
