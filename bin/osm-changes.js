#!/usr/bin/env node
// to silence EPIPE errors when piping to processes that close the stream ahead
// of time
require("epipebomb")();

const stats = require("../src/stats");

process.on("unhandledRejection", err => {
  throw err;
});

stats({
  delay: 1e3,
  infinite: true
});
