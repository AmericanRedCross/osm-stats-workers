var fs = require('fs');
var bookshelf = require('./src/common/bookshelf_init');
var R = require('ramda');
var Promise = require('bluebird');
var calculateMetrics = require('./src/calculate_metrics');

var changeset = JSON.parse(fs.readFileSync('./test/fixtures/example.json', 'utf8'));
var metrics = calculateMetrics(changeset);
var hashtags = getHashtags(changeset.metadata.comment);

var User = require('./src/models/User');
var Changeset = require('./src/models/Changeset');
var Hashtag = require('./src/models/Hashtag');

function createUserIfNotExists (user, transaction) {
  return User.where({id: user.id}).fetch().then(function (result) {
    if (!result) {
      return User.forge({
        id: user.id,
        name: user.name,
        geo_extent: user.geo_extent,
        avatar: user.avatar,
        created_at: new Date()
      }).save(null, {method: 'insert', transacting: transaction});
    } else {
      return result.save({
        geo_extent: user.geo_extent
      });
    }
  });
}

function getHashtags (str) {
  if (!str) return [];
  var wordlist = str.split(' ');
  var hashlist = [];
  wordlist.forEach(function (word) {
    if (word.startsWith('#') && !R.contains(word, hashlist)) {
      word = word.trim();
      word = word.replace(/,\s*$/, '');
      hashlist.push(word.slice(1));
    }
  });
  return hashlist;
}

function createHashtags (hashtags, transaction) {
  return Promise.map(hashtags, function (hashtag) {
    return Hashtag.where('hashtag', hashtag).fetch()
    .then(function (result) {
      if (!result) {
        return Hashtag.forge({
          hashtag: hashtag,
          created_at: new Date()
        }).save(null, {method: 'insert', transacting: transaction});
      } else {
        return result;
      }
    });
  });
}

function addToDB (metrics) {
  return bookshelf.transaction(function (t) {
    return Changeset.forge({
      id: metrics.id,
      road_count: metrics.metrics.road_count,
      building_count: metrics.metrics.building_count,
      waterway_count: metrics.metrics.waterway_count,
      poi_count: metrics.metrics.poi_count,
      gpstrace_count: metrics.metrics.gpstrace_count,
      road_km: metrics.metrics.road_km,
      waterway_km: metrics.metrics.waterway_km,
      gpstrace_km: metrics.metrics.gpstrace_km,
      editor: metrics.editor,
      user_id: metrics.user.id,
      created_at: new Date(metrics.created_at)
    }).save(null, {method: 'insert', transacting: t})
    .then(function (changeset) {
      return Promise.all([
        createUserIfNotExists(metrics.user, t),
        createHashtags(hashtags, t)
      ])
      .then(function (results) {
        var hashtags = results[1];
        return changeset.hashtags().attach(hashtags, {transacting: t});
      })
      .catch(function (err) {
        console.error(err);
      });
    });
  });
}

addToDB(metrics).then(function (results) {
  console.log(results);
});
