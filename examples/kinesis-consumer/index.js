// example handler to handle kinesis stream input

// load environmental variables
require('dotenv').config();
var Promise = require('bluebird');

exports.handler = function (event, context) {
  var Worker = require('../../');

  console.log('osm-stats v%s: processing %s records',
    require('./package.json').version,
    event.Records.length);

  // loop through all records in batch
  var worker = new Worker(function (err, changeset) {
    if (err) console.error(err);
    else console.log(changeset);
  });

  return Promise.map(event.Records, function (record) {
    var payload = new Buffer(record.kinesis.data, 'base64').toString('utf8');
    console.log('PAYLOAD:', payload);
    changeset = JSON.parse(payload);
    return worker.addToDB(changeset);
  }).then(function (result) {
      //return worker.destroy(function () {
        console.log('SUCCESS: (%s)', changeset.metadata.id, result);
        return context.succeed('Success');
      //});
  }).catch(function (err) {
      //return worker.destroy(function () {
        console.log('FAILURE: (%s)', changeset.metadata.id, err);
        console.trace();
        return context.succeed(err);
      //});
  });
};
