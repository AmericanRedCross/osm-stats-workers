var knex = require('../common/db_connection_knex');
var bookshelf = require('bookshelf')(knex);
var User = require('./User');
var Hashtag = require('./Hashtag');
var Country = require('./Country');

// Returns Changeset model
module.exports = bookshelf.Model.extend({
  tableName: 'changesets',
  users: function () {
    return this.belongsTo(User);
  },
  hashtags: function () {
    return this.belongsToMany(Hashtag);
  },
  countries: function () {
    return this.belongsToMany(Country);
  }
});
