var bookshelf = require('../common/bookshelf_init');
var R = require('ramda');

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
  }
});

module.exports = bookshelf.model('User', User);
