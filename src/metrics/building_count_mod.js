// Takes changeset, returns count of edited buildings
module.exports = function (changeset) {
  var elements = changeset.elements;
  var buildings = elements.filter(function (element) {
    return (element.tags &&
            element.action === 'modify' &&
            element.tags.hasOwnProperty('building'));
  });
  return buildings.length;
};
