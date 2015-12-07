// Takes changeset, returns count of road features
module.exports = function (changeset) {
  var elements = changeset.elements;
  var highways = elements.filter(function (element) {
    return element.tags.hasOwnProperty('highway');
  });
  return highways.length;
};
