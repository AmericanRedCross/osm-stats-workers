const length = require("@turf/length");
const { isWaterway, isWay } = require("..");

module.exports = feature =>
  isWay(feature) && isWaterway(feature)
    ? length(feature, { units: "kilometers" })
    : 0;
