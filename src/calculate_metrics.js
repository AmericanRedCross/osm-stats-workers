// This module calculates all the metrics for a given changeset

// require metric functions
var country = require('./metrics/country');
var roadCount = require('./metrics/road_count');
var buildingCount = require('./metrics/building_count');
var waterwayCount = require('./metrics/river_count');
var poiCount = require('./metrics/poi_count');
var roadLength = require('./metrics/road_length');
var waterwayLength = require('./metrics/river_length');
var extentCvHull = require('./metrics/geo_extent_convexhull');
var extentBuffer = require('./metrics/geo_extent_buffer');

module.exports = function (changeset, precision) {
  var metadata = changeset.metadata;
  precision = precision || 'hull';
  var geoExtentFunc = {};
  if (precision === 'hull') {
    geoExtentFunc = extentCvHull;
  } else if (precision === 'buffer') {
    geoExtentFunc = extentBuffer(100);
  } else {
    throw new Error('invalid geo extent parameter');
  }

  return {
    id: +metadata.id,
    hashtags: metadata.comment.split(' '),
    country: country(changeset),
    user: {
      id: +metadata.uid,
      name: metadata.user,
      avatar: '?', // todo: add avatar lookup
      geoExtent: geoExtentFunc(changeset)
    },
    metrics: {
      road_count: roadCount(changeset),
      building_count: buildingCount(changeset),
      waterway_count: waterwayCount(changeset),
      poi_count: poiCount(changeset),
      road_km: ~~(roadLength(changeset) * 100),
      waterway_km: ~~(waterwayLength(changeset) * 100)
      // todo: add GPS trace lookup; placeholder functions return 0
    },
    editor: metadata.created_by,
    created_at: metadata.created_at
  };
};
