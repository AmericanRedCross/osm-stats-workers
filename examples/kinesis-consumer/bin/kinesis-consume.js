#!/usr/bin/env node

// load environmental variables
require('dotenv').config()

var AWS = require('aws-sdk');
var Worker = require('../../../');
var worker = new Worker(function (err, changeset) {
  console.error(err);
  console.log(changeset);
});

var kinesis = new AWS.Kinesis({
  region: process.env.AWS_REGION || 'us-east-1',
  params: {
    StreamName: process.env.KINESIS_STREAM_NAME || 'test'
  }
});

var readable = require('kinesis-readable')(kinesis, {
  iterator: 'TRIM_HORIZON',
  limit: 1
});

readable.on('data', function (records) {
  processRecord(records[0].Data.toString());
})
.on('error', function (err) {
  console.error(err);
  worker.destroy();
});

function processRecord (data) {
  console.log('processing new record');
  try {
    worker.addToDB(JSON.parse(data));
  } catch (e) {
    console.error(e);
    console.log(data.metadata.id);
  }
}
