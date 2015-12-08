// Takes changeset, returns count of road features
module.exports = function (changeset) {
  var elements = changeset.elements;
  var buildings = elements.filter(function (element) {
    return element.tags.hasOwnProperty('building');
  });
  return buildings.length;
};
