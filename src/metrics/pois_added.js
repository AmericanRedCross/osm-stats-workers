const { isNew, isPOI } = require("..");

module.exports = feature => (isNew(feature) && isPOI(feature) ? 1 : 0);
