const { updateBadges } = require("../../../src/badges");

exports.handler = context => updateBadges(context.done);
