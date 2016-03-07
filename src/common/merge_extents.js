var turf = require('turf');

module.exports = function (extent1, extent2) {
  if (typeof extent1 === 'string') {
    extent1 = JSON.parse(extent1);
  }
  if (typeof extent2 === 'string') {
    extent2 = JSON.parse(extent2);
  }
  try {
    return turf.merge({
      'type': 'FeatureCollection',
      'features': [extent1, extent2]
    });
  } catch (err) {
    // in case of merge error just return the first extent
    console.log('Merge error: ', err);
    return extent1;
  }
};
