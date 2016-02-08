var turf = require('turf');

module.exports = function (extent1, extent2) {
  if (typeof extent1 === 'string') {
    extent1 = JSON.parse(extent1);
  }
  if (typeof extent2 === 'string') {
    extent2 = JSON.parse(extent2);
  }
  return turf.merge({
    'type': 'FeatureCollection',
    'features': [extent1, extent2]
  });
};
