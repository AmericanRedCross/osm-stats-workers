var turf = require('turf');

module.exports = function (extent1, extent2) {
  return turf.merge({
    'type': 'FeatureCollection',
    'features': [extent1, extent2]
  });
};
