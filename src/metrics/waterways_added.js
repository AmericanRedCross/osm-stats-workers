const { isNew, isWaterway, isWay } = require("..");

module.exports = feature =>
  isNew(feature) && isWay(feature) && isWaterway(feature) ? 1 : 0;
