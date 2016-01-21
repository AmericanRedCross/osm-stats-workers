var Promise = require('bluebird');
var getHashtags = require('./src/common/get_hashtags.js');

var calculateMetrics = require('./src/calculate_metrics');

var User = require('./src/models/User');
var Changeset = require('./src/models/Changeset');
var Hashtag = require('./src/models/Hashtag');
var Country = require('./src/models/Country');

var Worker = function (loggingFn) {
  loggingFn = loggingFn || function (data) { console.log('>', data); };
  this.bookshelf = require('./src/common/bookshelf_init');
  this.logger = loggingFn;
};

Worker.prototype.destroy = function () {
  this.bookshelf.knex.destroy();
};

Worker.prototype.addToDB = function (changeset) {
  this.changeset = changeset;
  var component = this;
  var metrics = {};
  try {
    metrics = calculateMetrics(changeset);
  } catch (e) {
    component.logger(e);
    return Promise.reject(e);
  }
  var hashtags = getHashtags(changeset.metadata.comment);

  return this.bookshelf.transaction(function (t) {
    return User.createUserIfNotExists(metrics.user, t)
    .then(function (user) {
      return Promise.join(
        Changeset.createChangesetIfNotExists(metrics, t),
        Hashtag.createHashtags(hashtags, t),
        Country.where({name: metrics.country}).fetch({transacting: t}),
        function (changeset, hashtags, country) {
          return Promise.all([
            changeset.hashtags().attach(hashtags, {transacting: t}),
            changeset.countries().attach(country, {transacting: t}),
            user.updateUserMetrics(metrics.metrics, metrics.user.geo_extent, t)
          ]);
        })
        .then(function (results) {
          var user = results[2];
          return Promise.join(
            user.getNumCountries(t),
            user.getHashtags(t),
            user.getTimestamps(t),
            function (numCountries, hashtags, timestamps) {
              metrics.metrics.numCountries = numCountries;
              metrics.metrics.hashtags = hashtags;
              metrics.metrics.timestamps = timestamps;
              return user.updateBadges(metrics.metrics, t);
            });
        });
    });
  })
  .catch(function (err) {
    component.logger(err, changeset);
    return Promise.reject(err);
  });
};

module.exports = Worker;
