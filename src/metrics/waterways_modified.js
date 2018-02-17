const { isModified, isWaterway, isWay } = require("..");

module.exports = feature =>
  isModified(feature) && isWay(feature) && isWaterway(feature) ? 1 : 0;
