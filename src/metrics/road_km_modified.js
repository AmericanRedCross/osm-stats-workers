const length = require("@turf/length");
const { isRoad, isWay } = require("..");

module.exports = (prev, next) =>
  isWay(prev) && isWay(next) && isRoad(prev) && isRoad(next)
    ? Math.abs(
        length(prev, { units: "kilometers" }) -
          length(next, { units: "kilometers" })
      )
    : 0;
