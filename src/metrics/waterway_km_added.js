const length = require("@turf/length");
const { isNew, isWaterway, isWay } = require("..");

module.exports = feature =>
  isNew(feature) && isWay(feature) && isWaterway(feature)
    ? length(feature, { units: "kilometers" })
    : 0;
