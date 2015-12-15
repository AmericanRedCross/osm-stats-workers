var knex = require('../common/db_connection_knex');
var bookshelf = require('bookshelf')(knex);
var Changeset = require('./Changeset');
var Badge = require('./Badge');

// Returns User model
module.exports = bookshelf.Model.extend({
  tableName: 'users',
  changesets: function () {
    return this.hasMany(Changeset);
  },
  badges: function () {
    this.belongsToMany(Badge);
  }
});
