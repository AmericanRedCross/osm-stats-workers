const { isBuilding, isNew } = require("..");

module.exports = feature => (isNew(feature) && isBuilding(feature) ? 1 : 0);
