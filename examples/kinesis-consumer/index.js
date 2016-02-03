# example handler to handle kinesis stream input

// load environmental variables
require('dotenv').config()

exports.handler = function(event, context) {
  console.log('osm-stats-version' + require('./package.json').version);

  event.Records.forEach(function(record) {
      // Kinesis data is base64 encoded so decode here
      var payload = new Buffer(record.kinesis.data, 'base64').toString('utf8');
      console.log('Payload:', payload);
      try {
        var worker = new Worker(function(err, changeset) {
          if (err) console.error(err);
          else console.log(changeset)
        });
        worker.addToDB(JSON.parse(payload));
      } catch (ex) {
        console.log('FAILURE', ex);
      }
  });

  context.succeed("SUCCESS");
};
