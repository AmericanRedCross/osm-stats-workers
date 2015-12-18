var geocoder = require('country-reverse-geocoding').country_reverse_geocoding();

// Looks up country at centroid of changeset
// May want to loop through features in changeset instead,
// to assemble a list of multiple countries where applicable
module.exports = function (changeset) {
  var metadata = changeset.metadata;
  var lat = (+metadata.min_lat + +metadata.max_lat) / 2;
  var lon = (+metadata.min_lon + +metadata.max_lon) / 2;
  return geocoder.get_country(lat, lon).name;
};
