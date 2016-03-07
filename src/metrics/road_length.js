var measureWayLength = require('../common/measure_way_length');

// Takes changeset, returns total length of roads in KM
module.exports = function (changeset) {
  var elements = changeset.elements;
  var highways = elements.filter(function (element) {
    return (element.tags &&
            element.action === 'create' &&
            element.tags.hasOwnProperty('highway'));
  });
  return measureWayLength(highways);
};
