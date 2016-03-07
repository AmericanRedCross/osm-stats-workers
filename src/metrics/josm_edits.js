// Returns 1 if JOSM was used, 0 otherwise
module.exports = function (editorStr) {
  return editorStr.toLowerCase().match(/^josm/) ? 1 : 0;
};
