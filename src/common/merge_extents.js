var turf = require('turf');

module.exports = function (extent1, extent2) {
  if (typeof extent1 === 'string') {
    extent1 = JSON.parse(extent1);
  }
  if (typeof extent2 === 'string') {
    extent2 = JSON.parse(extent2);
  }
  try {
    if (extent1.geometry.type == 'GeometryCollection') {
        // legacy user geometry, won't happen with fresh database
        return extent2;
    }
    return turf.merge({
      'type': 'FeatureCollection',
      'features': [extent1, extent2]
    });
  } catch (err) {
    // in case of merge error just return the second extent
    console.log('ERROR: (merge)', err, JSON.stringify(extent1), JSON.stringify(extent2));
    return extent1;
  }
};
