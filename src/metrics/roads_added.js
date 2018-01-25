const { isNew, isRoad, isWay } = require("..");

module.exports = feature =>
  isNew(feature) && isWay(feature) && isRoad(feature) ? 1 : 0;
