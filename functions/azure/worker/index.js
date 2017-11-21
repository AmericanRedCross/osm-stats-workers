var Worker = require('../../../');

exports.handler = (context, messages) => {
  context.log('processing %d message(s)', messages.length);

  var worker = new Worker(context.log);
  Promise.all(messages.map(msg => worker.addToDB(msg)))
    .then(output => {
      context.log('Output:', output);
      context.done();
    })
    .catch(context.done);
};
