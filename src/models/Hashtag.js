var knex = require('../common/db_connection_knex');
var bookshelf = require('bookshelf')(knex);
var Changeset = require('./Changeset');

// Returns Hashtag model
module.exports = bookshelf.Model.extend({
  tableName: 'hashtags',
  changesets: function () {
    return this.belongsToMany(Changeset);
  }
});
