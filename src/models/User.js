var R = require('ramda');
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
  updateUserMetrics: function (metrics, newExtent, transaction) {
    var user = this;
    var opts = {method: 'update'};
    if (transaction) {
      opts.transacting = transaction;
    }
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
    }, opts);
  },
  updateBadges: function (metrics, transaction) {
    var user = this;
    var opts = {};
    if (transaction) {
      opts.transacting = transaction;
    }
    var sumBadges = sumCheck({
      roads: user.attributes.total_road_count_add,
      roadMods: user.attributes.total_road_count_mod,
      buildings: user.attributes.total_building_count_add,
      pois: user.attributes.total_poi_count_add,
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
      console.log(badge);
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
});

module.exports = bookshelf.model('User', User);
