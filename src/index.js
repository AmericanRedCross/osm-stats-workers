const POI_TAGS = ["amenity", "shop", "craft", "office", "leisure", "aeroway"];
const WATERWAY_VALUES = ["river", "canal", "stream", "brook", "drain", "ditch"];

module.exports.NOOP = () => {};

module.exports.isBuilding = ({ properties: { tags } }) =>
  tags.building != null &&
  !["no", "false", "0"].includes(tags.building.toLowerCase());

module.exports.isModified = ({ properties: { version } }) =>
  Number(version) > 1;

module.exports.isNew = ({ properties: { version } }) => Number(version) === 1;

module.exports.isNode = ({ properties: { type } }) => type === "node";

module.exports.isPOI = ({ properties: { tags } }) =>
  POI_TAGS.some(x => Object.keys(tags).includes(x));

module.exports.isRelation = ({ properties: { type } }) => type === "relation";

module.exports.isRoad = ({ properties: { tags } }) => tags.highway != null;

module.exports.isWaterway = ({ properties: { tags } }) =>
  WATERWAY_VALUES.includes(tags.waterway);

module.exports.isWay = ({ properties: { type } }) => type === "way";
