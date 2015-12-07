// Extract a property from an object
module.exports = function (data, property) {
  var result = data[property];
  if (!delete data[property]) throw new Error();
  return result;
};
