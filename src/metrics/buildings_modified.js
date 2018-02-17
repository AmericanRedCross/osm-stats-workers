const { isBuilding, isModified } = require("..");

module.exports = feature =>
  isModified(feature) && isBuilding(feature) ? 1 : 0;
