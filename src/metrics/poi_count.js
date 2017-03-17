// Takes changeset, returns count of POI features
module.exports = function (changeset) {
  var elements = changeset.elements;
  var amenities = elements.filter(function (element) {
    return (element.tags && (element.tags.hasOwnProperty('amenity') || element.tags.hasOwnProperty('shop') || element.tags.hasOwnProperty('craft') || element.tags.hasOwnProperty('office') || element.tags.hasOwnProperty('leisure') || element.tags.hasOwnProperty('aeroway')));
  });
  return amenities.length;
};
