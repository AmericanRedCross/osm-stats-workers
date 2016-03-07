// Takes changeset, returns count of waterway features
module.exports = function (changeset) {
  var elements = changeset.elements;
  var waterways = elements.filter(function (element) {
    return (element.tags && element.tags.hasOwnProperty('waterway'));
  });
  return waterways.length;
};
