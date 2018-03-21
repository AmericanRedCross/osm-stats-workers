#!/usr/bin/env node

const { updateBadges } = require("../src/badges");

process.on("unhandledRejection", err => {
  throw err;
});

updateBadges();
