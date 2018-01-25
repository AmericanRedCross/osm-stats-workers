const { Transform } = require("stream");

const { isBuilding, isPOI, isRoad, isWaterway } = require(".");
const buildingsAdded = require("./metrics/buildings_added");
const buildingsModified = require("./metrics/buildings_modified");
const countries = require("./metrics/countries");
const poisAdded = require("./metrics/pois_added");
const poisModified = require("./metrics/pois_modified");
const roadKmAdded = require("./metrics/road_km_added");
const roadKmDeleted = require("./metrics/road_km_deleted");
const roadKmModified = require("./metrics/road_km_modified");
const roadsAdded = require("./metrics/roads_added");
const roadsModified = require("./metrics/roads_modified");
const waterwayKmAdded = require("./metrics/waterway_km_added");
const waterwayKmDeleted = require("./metrics/waterway_km_deleted");
const waterwayKmModified = require("./metrics/waterway_km_modified");
const waterwaysAdded = require("./metrics/waterways_added");
const waterwaysModified = require("./metrics/waterways_modified");

const isInteresting = feature =>
  ["node", "way"].includes(feature.properties.type) &&
  (isBuilding(feature) ||
    isPOI(feature) ||
    isRoad(feature) ||
    isWaterway(feature));

/**
 * Consumes GeoJSON FeatureCollection representations of elements within
 * augmented diffs.
 */
module.exports = class StatsStream extends Transform {
  constructor() {
    super({
      objectMode: true
    });
  }

  _transform(obj, _, callback) {
    switch (obj.id) {
      case "create":
        return this.handleCreate(obj, callback);

      case "modify":
        return this.handleModify(obj, callback);

      case "delete":
        return this.handleDelete(obj, callback);

      case "minorVersion":
        return this.handleMinorVersion(obj, callback);

      default:
        return callback();
    }
  }

  handleCreate(fc, callback) {
    const feature = fc.features.find(f => f.id === "new");

    if (!isInteresting(feature)) {
      return callback();
    }

    this.push({
      changeset: feature.properties.changeset,
      stats: {
        roadsAdded: roadsAdded(feature),
        waterwaysAdded: waterwaysAdded(feature),
        buildingsAdded: buildingsAdded(feature),
        roadKmAdded: roadKmAdded(feature),
        waterwayKmAdded: waterwayKmAdded(feature),
        poisAdded: poisAdded(feature),
        countries: countries(feature)
      }
    });

    return callback();
  }

  handleModify(fc, callback) {
    const prev = fc.features.find(f => f.id === "old");
    const next = fc.features.find(f => f.id === "new");

    if (!isInteresting(prev) && !isInteresting(next)) {
      return callback();
    }

    this.push({
      changeset: next.properties.changeset,
      stats: {
        roadsModified: roadsModified(next),
        waterwaysModified: waterwaysModified(next),
        buildingsModified: buildingsModified(next),
        roadKmModified: roadKmModified(prev, next),
        waterwayKmModified: waterwayKmModified(prev, next),
        poisModified: poisModified(next),
        countries: countries(next)
      }
    });

    return callback();
  }

  handleDelete(fc, callback) {
    const prev = fc.features.find(f => f.id === "old");
    const next = fc.features.find(f => f.id === "new");

    if (!isInteresting(prev) && !isInteresting(next)) {
      return callback();
    }

    this.push({
      changeset: next.properties.changeset,
      stats: {
        roadsModified: roadsModified(prev),
        waterwaysModified: waterwaysModified(prev),
        buildingsModified: buildingsModified(prev),
        roadKmModified: roadKmDeleted(prev),
        waterwayKmModified: waterwayKmDeleted(prev),
        poisModified: poisModified(prev),
        countries: countries(prev)
      }
    });

    return callback();
  }

  handleMinorVersion(fc, callback) {
    const prev = fc.features.find(f => f.id === "old");
    const next = fc.features.find(f => f.id === "new");

    if (!isInteresting(prev) && !isInteresting(next)) {
      return callback();
    }

    this.push({
      changeset: next.properties.changeset,
      stats: {
        roadsModified: roadsModified(next),
        waterwaysModified: waterwaysModified(next),
        buildingsModified: buildingsModified(next),
        roadKmModified: roadKmModified(prev, next),
        waterwayKmModified: waterwayKmModified(prev, next),
        poisModified: poisModified(next),
        countries: countries(next)
      }
    });

    return callback();
  }
};
