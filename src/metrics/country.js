var geocoder = require('country-reverse-geocoding').country_reverse_geocoding();
var R = require('ramda');
var turf = require('turf');

// Looks up country at centroid of changeset
// May want to loop through features in changeset instead,
// to assemble a list of multiple countries where applicable
module.exports = function (buf) {
  var countries = [];
  if (buf.geometry.type === 'MultiPolygon') {
    var polygons = R.map(turf.polygon, buf.geometry.coordinates);
    var centroids = R.map(turf.centroid, polygons);
    countries = centroids.map(function (centroid) {
      var coordinates = centroid.geometry.coordinates;
      var country = geocoder.get_country(coordinates[1], coordinates[0]);
      if (country) {
        return country.name;
      } else {
        return 'None';
      }
    })
    .filter(function (country) {
      return country !== 'None';
    });
  } else {
    var centroid = turf.centroid(buf);
    var coordinates = centroid.geometry.coordinates;
    var country = geocoder.get_country(coordinates[1], coordinates[0]);
    if (country) {
      return [country.name];
    } else {
      return [];
    }
  }
  return countries;
};
