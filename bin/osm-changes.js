#!/usr/bin/env node
// to silence EPIPE errors when piping to processes that close the stream ahead
// of time
require("epipebomb")();
const http = require("http");

const stats = require("../src/stats");

process.on("unhandledRejection", err => {
  throw err;
});

stats({
  infinite: true
});

http.createServer((req, res) => res.end("ok")).listen(process.env.PORT || 8080);
