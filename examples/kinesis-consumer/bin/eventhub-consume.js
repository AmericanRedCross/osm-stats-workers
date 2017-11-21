#!/usr/bin/env node

require('babel-polyfill');
const env = require('require-env');
const { sources: { EventHub } } = require('osm-replication-streams');

var Worker = require('../../../');

var worker = new Worker(function (err, changeset) {
  console.error(err);
  console.log(changeset);
});

var source = new EventHub(env.require('EH_CONNSTRING'), env.require('EH_PATH'));

source.on('data', processRecord)
.on('error', err => {
  console.error(err);
  worker.destroy();
});

function processRecord (data) {
  console.log('processing new record:', data);
  try {
    worker.addToDB(data);
  } catch (e) {
    console.error(e);
    console.log(data.metadata.id);
  }
}
