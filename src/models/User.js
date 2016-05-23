var R = require('ramda');
var fetch = require('request-promise');
var bookshelf = require('../common/bookshelf_init');
var mergeExtents = require('../common/merge_extents.js');
var sumCheck = require('../badges/sum_check');
var dateSequentialCheck = require('../badges/date_check_sequential');
var dateTotalCheck = require('../badges/date_check_total.js');
var Badge = require('./Badge.js');
var Promise = require('bluebird');

require('./Changeset');
require('./Badge');
require('./Hashtag');

// Returns User model
var User = bookshelf.Model.extend({
  jsonColumns: ['geo_extent'],
  tableName: 'users',

  changesets: function () {
    return this.hasMany('Changeset');
  },
  badges: function () {
    return this.belongsToMany('Badge', 'badges_users');
  },
  getNumCountries: function (trx) {
    // Check if we're in a transaction
    var qb = trx || bookshelf.knex;

    // Subquery to find the relevant changesets
    var subquery = qb.select('id')
    .from('changesets')
    .where('user_id', this.attributes.id);

    // Get the country ids from the junction table
    return qb.select('country_id')
    .from('changesets_countries')
    .where('changeset_id', 'in', subquery)
    .then(function (results) {
      // Pluck the country_id from results and check uniqueness
      var ids = R.uniq(R.map(R.prop('country_id'), results));
      return ids.length;
    });
  },
  getHashtags: function (trx) {
    // Check if we're in a transaction
    var qb = trx || bookshelf.knex;

    // Subquery to find the relevant changesets
    var subquery = qb.select('id')
    .from('changesets')
    .where('user_id', this.attributes.id);

    // Get the hashtags by joining on the junction table
    return qb.select('hashtag')
    .from('changesets_hashtags')
    .join('hashtags', 'changesets_hashtags.hashtag_id', 'hashtags.id')
    .where('changeset_id', 'in', subquery)
    .then(function (results) {
      return R.uniq(R.map(R.prop('hashtag'), results));
    });
  },
  getTimestamps: function (trx) {
    // Check if we're in a transaction
    var qb = trx || bookshelf.knex;

    return qb.select('created_at')
    .from('changesets')
    .where('user_id', this.attributes.id)
    .then(function (results) {
      return R.map(R.prop('created_at'), results);
    });
  },
  getGpsTraceCount: function () {
    var userId = this.attributes.id;
    return fetch('http://api.openstreetmap.org/api/0.6/user/' + userId)
    .then(function (xml) {
      var traceCount = 0;
      var traceBegin = xml.split('<traces count="')[1];
      if (traceBegin) {
        traceCount = Number(traceBegin.substring(0, traceBegin.indexOf('"/>')));
      }
      return traceCount;
    });
  },
  getTaskingManagerStats: function (userId) {
    var userTaskStats = {done: 0, validated: 0, invalidated: 0};
    return fetch('http://localhost/~nick/user_data/' + userId + '.json')
    .then(function (response) {
      console.log('theresponse', response.status);
      if (response.statusCode >= 400) {
        return userTaskStats;
      }
      return response.json();
    })
    .then(function (json) {
      console.log(json)
      var user = JSON.parse(json);
      Object.keys(user).forEach(function (project) {
        userTaskStats.done += user[project].done.times.length;
        userTaskStats.validated += user[project].validated.times.length;
        userTaskStats.invalidated += user[project].invalidated.times.length;
      });
      return userTaskStats;
    });
  },
  updateUserMetrics: function (metrics, newExtent, transaction) {
    var user = this;
    var userMetrics = user.attributes;
    var opts = {method: 'update'};
    if (transaction) {
      opts.transacting = transaction;
    }

    var metricsToSave = {
      geo_extent:
        mergeExtents(userMetrics.geo_extent, newExtent),
      total_building_count_add:
        Number(userMetrics.total_building_count_add) + Number(metrics.building_count),
      total_building_count_mod:
        Number(userMetrics.total_building_count_mod) + Number(metrics.building_count_mod),
      total_waterway_count_add:
        Number(userMetrics.total_waterway_count_add) + Number(metrics.waterway_count),
      total_poi_count_add:
        Number(userMetrics.total_poi_count_add) + Number(metrics.poi_count),
      total_road_km_add:
        Number(userMetrics.total_road_km_add) + Number(metrics.road_km),
      total_road_km_mod:
        Number(userMetrics.total_road_km_mod) + Number(metrics.road_km_mod),
      total_waterway_km_add:
        Number(userMetrics.total_waterway_km_add) + Number(metrics.waterway_km),
      total_josm_edit_count:
         Number(user.attributes.total_josm_edit_count) + Number(metrics.josm_edits)
    };

    // Get Tasking Manager squares done, validated, and invalidated statistics
    // from Humanitarian Open Street Maps data.
    this.getTaskingManagerStats(userMetrics.id).then(function (taskManagerStats) {
      metricsToSave.total_tm_done_count = Number(taskManagerStats.done);
      metricsToSave.total_tm_val_count = Number(taskManagerStats.validated);
      metricsToSave.total_tm_inval_count = Number(taskManagerStats.invalidated);
    });

    // If >10 minutes (600,000 ms) since GPS trace count last updated, fetch
    // count from OSM user API and save it along with other updated metrics
    var gpsTraceUpdatedDate = userMetrics.total_gps_trace_updated_from_osm;
    if ((new Date() - gpsTraceUpdatedDate) > 600000) {
      return this.getGpsTraceCount(userMetrics.id).then(function (gpsTraceCount) {
        metricsToSave.total_gps_trace_count_add = gpsTraceCount;
        metricsToSave.total_gps_trace_updated_from_osm = new Date();
        return user.save(metricsToSave, opts);
      });
    // If <10 minutes since GPS trace count last updated, skip the lookup
    // and save only the other updated metrics
    } else {
      return user.save(metricsToSave, opts);
    }
  },
  updateBadges: function (metrics, transaction) {
    var user = this;
    var opts = {};
    if (transaction) {
      opts.transacting = transaction;
    }
    var sumBadges = sumCheck({
      buildings: user.attributes.total_building_count_add,
      pois: user.attributes.total_poi_count_add,
      roadKms: user.attributes.total_road_km_add,
      roadKmMods: user.attributes.total_road_km_mod,
      waterways: user.attributes.total_waterway_km_add,
      josm: user.attributes.total_josm_edit_count,
      gpsTraces: user.attributes.total_gps_trace_count_add
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
      return Badge.where({category: badge.category, level: badge.level}).fetch({transacting: transaction})
      .then(function (badge) {
        return user.badges().attach(badge, opts);
      });
    });
  }
}, {
  createUserIfNotExists: function (user, transaction) {
    return User.where({id: user.id}).fetch({withRelated: 'badges', transacting: transaction}).then(function (result) {
      if (!result) {
        return User.forge({
          id: user.id,
          name: user.name,
          geo_extent: user.geo_extent,
          avatar: user.avatar,
          total_building_count_add: 0,
          total_building_count_mod: 0,
          total_waterway_count_add: 0,
          total_poi_count_add: 0,
          total_gpstrace_count_add: 0,
          total_gps_trace_updated_from_osm: new Date(1970, 1, 1),
          total_road_km_add: 0,
          total_road_km_mod: 0,
          total_waterway_km_add: 0,
          created_at: new Date(),
          total_josm_edit_count: 0
        }).save(null, {method: 'insert', transacting: transaction});
      } else {
        return result;
      }
    });
  }
});

module.exports = bookshelf.model('User', User);
