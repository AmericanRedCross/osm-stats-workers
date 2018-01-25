// TODO switch to stream implementation
const Worker = require("../../../");

exports.handler = (context, messages) => {
  context.log("processing %d message(s)", messages.length);

  const worker = new Worker(context.log);
  Promise.all(messages.map(msg => worker.addToDB(msg)))
    .then(output => {
      context.log("Output:", output);
      return context.done();
    })
    .catch(context.done);
};
