const buffer = require("@turf/buffer");
const { featureCollection } = require("@turf/helpers");
const { flattenReduce } = require("@turf/meta");
const geojsonRbush = require("geojson-rbush");
const martinez = require("martinez-polygon-clipping");

const countries = require("./countries.json");

// break apart multi* geometries for faster intersections
const features = featureCollection(
  flattenReduce(
    countries,
    (acc, currentFeature) => acc.concat(currentFeature),
    []
  )
);

const COUNTRY_INDEX = geojsonRbush();

COUNTRY_INDEX.load(features);

module.exports = feature => {
  if (["Point", "LineString"].includes(feature.geometry.type)) {
    feature = buffer(feature, 0.000001, { units: "degrees" });
  }

  // workaround for https://github.com/w8r/martinez/issues/74
  if (feature.properties.id === "576508727") {
    return ["IDN"];
  }

  if (["579309067", "579321989", "579322275", "579322453", "579335697", "579335718", "579335723", "579441805", "579441820", "579441855", "579441892", "579461467", "579480657", "579480896", "579486885", "579502293", "579891116", "580014877", "580014931"].includes(feature.properties.id)) {
    return ["MYS"];
  }

  return COUNTRY_INDEX.search(feature)
    .features.filter(x => {
      try {
        const i = martinez.intersection(
          x.geometry.coordinates,
          feature.geometry.coordinates
        );

        return i != null && i.length > 0;
      } catch (err) {
        // buffer to convert to a Polygon
        const i = martinez.intersection(
          x.geometry.coordinates,
          buffer(feature, 0.000001, { units: "degrees" }).geometry.coordinates
        );

        return i != null && i.length > 0;
      }
    })
    .map(x => x.properties.ADM0_A3);
};
