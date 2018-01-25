const buffer = require("@turf/buffer");
const geojsonRbush = require("geojson-rbush");
const martinez = require("martinez-polygon-clipping");

const countries = require("./countries.json");

const COUNTRY_INDEX = geojsonRbush();

COUNTRY_INDEX.load(countries);

module.exports = feature =>
  COUNTRY_INDEX.search(feature)
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
    .map(x => x.properties.ADM0_A3_US);
