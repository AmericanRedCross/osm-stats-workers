var turf = require('turf');

// Takes OSM changeset, Returns convex hull of changeset
// features as GeoJSON.
module.exports = function (changeset) {
  // Explode OSM features to points
  var points = [];
  changeset.elements.forEach(function(el) {
    if (el.type && el.type == 'node') {
      points.push({
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [el.lon, el.lat]
        },
        'properties': {}
      });
    } else if (el.nodes) {
      el.nodes.forEach(function(n) {
        points.push({
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [n.lon, n.lat]
          },
          'properties': {}
        })
      });
    }
  });

  // Return as point (if 1), linestring (if 2 or 3) or polygon (4+)
  if (points.length == 1) {
    return {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': points[0].geometry.coordinates
      },
      'properties': {}
    }
  } else if (points.length < 4) {
    var ls = points.map(function (point) {
      return point.geometry.coordinates
    });
    return {
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': ls
      },
      'properties': {}
    }
  } else {
    // calculate convex hull
    var convexHull = turf.convex({
      'type': 'FeatureCollection',
      'features': points,
    });
    return convexHull;    
  }
};
