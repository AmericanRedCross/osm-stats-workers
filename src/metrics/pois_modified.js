const { isModified, isPOI } = require("..");

module.exports = feature => (isModified(feature) && isPOI(feature) ? 1 : 0);
