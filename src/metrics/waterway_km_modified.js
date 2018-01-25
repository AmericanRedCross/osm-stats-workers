const length = require("@turf/length");
const { isWaterway, isWay } = require("..");

module.exports = (prev, next) =>
  isWay(prev) && isWay(next) && isWaterway(prev) && isWaterway(next)
    ? Math.abs(
        length(prev, { units: "kilometers" }) -
          length(next, { units: "kilometers" })
      )
    : 0;
