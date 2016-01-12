require('string.prototype.startswith');
var fs = require('fs');
var bookshelf = require('./src/common/bookshelf_init');
var R = require('ramda');
var calculateMetrics = require('./src/calculate_metrics');
var Promise = require('bluebird');
var changeset = JSON.parse(fs.readFileSync('./test/fixtures/example.json', 'utf8'));
var metrics = calculateMetrics(changeset);
var hashtags = getHashtags(changeset.metadata.comment);

var changeset2 = R.clone(changeset);
changeset2.metadata.id = 12345;
var metrics2 = calculateMetrics(changeset2);

var User = require('./src/models/User');
var Changeset = require('./src/models/Changeset');
var Hashtag = require('./src/models/Hashtag');
var Country = require('./src/models/Country');

function createChangesetIfNotExists (metrics, transaction) {
  return Changeset.where({id: metrics.id}).fetch().then(function (result) {
    if (!result) {
      return Changeset.forge({
        id: metrics.id,
        road_count_add: metrics.metrics.road_count,
        road_count_mod: metrics.metrics.road_count_mod,
        building_count_add: metrics.metrics.building_count,
        building_count_mod: metrics.metrics.building_count_mod,
        waterway_count_add: metrics.metrics.waterway_count,
        poi_count_add: metrics.metrics.poi_count,
        // GPS trace not yet implemented
        gpstrace_count_add: 0,
        road_km_add: metrics.metrics.road_km,
        road_km_mod: metrics.metrics.road_km_mod,
        waterway_km_add: metrics.metrics.waterway_km,
        // GPS trace not yet implemented
        gpstrace_km_add: 0,
        editor: metrics.editor,
        user_id: metrics.user.id,
        created_at: new Date(metrics.created_at)
      }).save(null, {method: 'insert', transacting: transaction});
    } else {
      throw new Error('Changeset exists');
    }
  });
}

function updateUserMetrics (user, metrics, transaction) {
  console.log(user.attributes);
  return user.save({
    total_road_count_add:
      user.attributes.total_road_count_add + metrics.road_count,
    total_road_count_mod:
      user.attributes.total_road_count_mod + metrics.road_count_mod,
    total_building_count_add:
      user.attributes.total_building_count_add + metrics.building_count,
    total_building_count_mod:
      user.attributes.total_building_count_mod + metrics.building_count_mod,
    total_waterway_count_add:
      user.attributes.total_waterway_count_add + metrics.waterway_count,
    total_poi_count_add:
      user.attributes.total_poi_count_add + metrics.poi_count,
    // GPS trace not yet implemented
    total_gpstrace_count_add:
      0,
    total_road_km_add:
      user.attributes.total_road_km_add + metrics.road_km,
    total_road_km_mod:
      user.attributes.total_road_km_mod + metrics.road_km_mod,
    total_waterway_km_add:
      user.attributes.total_waterway_km_add + metrics.waterway_km,
    // GPS trace not yet implemented
    total_gpstrace_km_add:
      0
  }, {transacting: transaction});
}

function createUserIfNotExists (user, transaction) {
  return User.where({id: user.id}).fetch().then(function (result) {
    if (!result) {
      return User.forge({
        id: user.id,
        name: user.name,
        geo_extent: user.geo_extent,
        avatar: user.avatar,
        total_road_count_add: 0,
        total_road_count_mod: 0,
        total_building_count_add: 0,
        total_building_count_mod: 0,
        total_waterway_count_add: 0,
        total_poi_count_add: 0,
        // GPS trace not yet implemented
        total_gpstrace_count_add: 0,
        total_road_km_add: 0,
        total_road_km_mod: 0,
        total_waterway_km_add: 0,
        // GPS trace not yet implemented
        total_gpstrace_km_add: 0,
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

function lookupCountry (country) {
  return Country.where({name: country}).fetch();
}

function addToDB (metrics) {
  return bookshelf.transaction(function (t) {
    return Promise.all([
      createUserIfNotExists(metrics.user, t),
      createChangesetIfNotExists(metrics, t),
      createHashtags(hashtags, t),
      lookupCountry(metrics.country, t)
    ])
    .then(function (results) {
      var user = results[0];
      var changeset = results[1];
      var hashtags = results[2];
      var country = results[3];
      return Promise.all([
        changeset.hashtags().attach(hashtags, {transacting: t}),
        changeset.countries().attach(country, {transacting: t}),
        updateUserMetrics(user, metrics.metrics, t)
      ]);
    });
    // .then(function () {
    //   // return User.forge({id: metrics.user.id}).getNumCountries(t);
    // });
  })
  .catch(function (err) {
    console.error('Error', err);
  });
}

addToDB(metrics).then(function (results) {
  return addToDB(metrics2);
}).then(function (results) {
  console.log(results);
}).finally(function () {
  bookshelf.knex.destroy();
});
