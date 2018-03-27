const housekeeping = require("../../../src/housekeeping");

exports.handler = context =>
  housekeeping.then(() => context.done()).catch(err => context.done(err));
