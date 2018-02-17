#!/usr/bin/env node

const housekeeping = require("../src/housekeeping");


process.on("unhandledRejection", err => {
  throw err;
});

housekeeping();
