// Takes changeset, returns count of POI features
module.exports = function (changeset) {
  var elements = changeset.elements;
  var amenities = elements.filter(function (element) {
    return (element.tags && element.tags.hasOwnProperty('amenity'));
  });
  return amenities.length;
};
