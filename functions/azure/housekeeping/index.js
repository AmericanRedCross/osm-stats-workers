const housekeeping = require("../../../src/housekeeping")

exports.handler = context => housekeeping(context.done);
