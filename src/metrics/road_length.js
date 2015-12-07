var popProperty = require('../common/pop_property');
var measureWayLength = require('../common/measure_way_length');

// Takes changeset, returns total length of loads in KM
module.exports = function (changeset) {
  var elements = popProperty(changeset, 'elements');
  var highways = elements.filter(function (element) {
    return element.tags.highway === 'yes';
  });
  return measureWayLength(highways);
};
