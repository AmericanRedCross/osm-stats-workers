const { isModified, isRoad, isWay } = require("..");

module.exports = feature =>
  isModified(feature) && isWay(feature) && isRoad(feature) ? 1 : 0;
