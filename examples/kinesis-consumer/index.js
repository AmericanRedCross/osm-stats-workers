// example handler to handle kinesis stream input

// load environmental variables
require('dotenv').config();

var Worker = require('../../');
var Promise = require('bluebird');

exports.handler = function (event, context) {
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
    return worker.addToDB(JSON.parse(payload));
  }).then(function (result) {
      console.log('SUCCESS:', result);
      return context.succeed('Success');
  }).catch(function (err) {
    console.log('FAILURE:', err);
    return context.fail(err);
  });
};
