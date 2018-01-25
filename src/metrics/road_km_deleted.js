const length = require("@turf/length");
const { isRoad, isWay } = require("..");

module.exports = feature =>
  isWay(feature) && isRoad(feature)
    ? length(feature, { units: "kilometers" })
    : 0;
