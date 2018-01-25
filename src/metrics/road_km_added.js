const length = require("@turf/length");
const { isNew, isRoad, isWay } = require("..");

module.exports = feature =>
  isNew(feature) && isWay(feature) && isRoad(feature)
    ? length(feature, { units: "kilometers" })
    : 0;
