var Promise = require('bluebird');
var R = require('ramda');
var turf = require('turf');

var bookshelf = require('./src/common/bookshelf_init');
var calculateMetrics = require('./src/calculate_metrics');

var sumCheck = require('./src/badges/sum_check');
var dateSequentialCheck = require('./src/badges/date_check_sequential');
var dateTotalCheck = require('./src/badges/date_check_total.js');

var User = require('./src/models/User');
var Changeset = require('./src/models/Changeset');
var Hashtag = require('./src/models/Hashtag');
var Country = require('./src/models/Country');
var Badge = require('./src/models/Badge');

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

function mergeExtents (extent1, extent2) {
  return turf.merge({
    'type': 'FeatureCollection',
    'features': [extent1, extent2]
  });
}

function updateUserMetrics (user, metrics, newExtent, transaction) {
  return user.save({
    geo_extent:
      mergeExtents(user.attributes.geo_extent, newExtent),
    total_road_count_add:
      Number(user.attributes.total_road_count_add) + Number(metrics.road_count),
    total_road_count_mod:
      Number(user.attributes.total_road_count_mod) + Number(metrics.road_count_mod),
    total_building_count_add:
      Number(user.attributes.total_building_count_add) + Number(metrics.building_count),
    total_building_count_mod:
      Number(user.attributes.total_building_count_mod) + Number(metrics.building_count_mod),
    total_waterway_count_add:
      Number(user.attributes.total_waterway_count_add) + Number(metrics.waterway_count),
    total_poi_count_add:
      Number(user.attributes.total_poi_count_add) + Number(metrics.poi_count),
    // GPS trace not yet implemented
    total_gpstrace_count_add:
      0,
    total_road_km_add:
      Number(user.attributes.total_road_km_add) + Number(metrics.road_km),
    total_road_km_mod:
      Number(user.attributes.total_road_km_mod) + Number(metrics.road_km_mod),
    total_waterway_km_add:
      Number(user.attributes.total_waterway_km_add) + Number(metrics.waterway_km),
    // GPS trace not yet implemented
    total_gpstrace_km_add:
      0
  }, {method: 'update', transacting: transaction});
}

function createUserIfNotExists (user, transaction) {
  return User.where({id: user.id}).fetch({withRelated: 'badges'}).then(function (result) {
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
      return result;
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

function updateBadges (user, metrics, transaction) {
  var sumBadges = sumCheck({
    roads: user.attributes.total_road_count_add,
    roadMods: user.attributes.total_road_count_mod,
    buildings: user.attributes.total_building_count_add,
    pois: user.attributes.total_poi_count_add,
    gpsTraces: user.attributes.total_poi_count_add,
    roadKms: user.attributes.total_road_km_add,
    roadKmMods: user.attributes.total_road_km_mod,
    waterways: user.attributes.total_waterway_km_add
  });
  var consistencyBadge = dateSequentialCheck(metrics.timestamps);
  var historyBadge = dateTotalCheck(metrics.timestamps);
  var earnedBadges = R.mergeAll([
    sumBadges, consistencyBadge, historyBadge
  ]);

  var pickerFunction = R.pick(['category', 'level']);
  var pickFromArray = R.map(pickerFunction);

  var currentBadges = user.related('badges').toJSON();
  var earnedBadgeLevels = pickFromArray(R.values(earnedBadges));
  var currentBadgeLevels = pickFromArray(currentBadges);
  var newBadges = R.difference(earnedBadgeLevels, currentBadgeLevels);

  return Promise.map(newBadges, function (badge) {
    return Badge.where({category: badge.category, level: badge.level}).fetch()
    .then(function (badge) {
      return user.badges().attach(badge, {transacting: transaction});
    });
  });
}

module.exports = function (changeset) {
  var metrics = calculateMetrics(changeset);
  var hashtags = getHashtags(changeset.metadata.comment);

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
        updateUserMetrics(user, metrics.metrics, metrics.user.geo_extent, t)
      ]);
    })
    .then(function (results) {
      var user = results[2];
      return Promise.all([
        user.getNumCountries(t),
        user.getHashtags(t),
        user.getTimestamps(t)
      ]).then(function (additionalMetrics) {
        var numCountries = additionalMetrics[0];
        var hashtags = additionalMetrics[1];
        var timestamps = additionalMetrics[2];
        metrics.metrics.numCountries = numCountries;
        metrics.metrics.hashtags = hashtags;
        metrics.metrics.timestamps = timestamps;
        return updateBadges(user, metrics.metrics, t);
      });
    });
  })
  .catch(function (err) {
    throw new Error(err);
  })
  .finally(function () {
    bookshelf.knex.destroy();
  });
};
