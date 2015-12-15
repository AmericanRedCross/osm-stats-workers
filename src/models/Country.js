var knex = require('../common/db_connection_knex');
var bookshelf = require('bookshelf')(knex);
var Changeset = require('./Changeset');

// Returns Country model
module.exports = bookshelf.Model.extend({
  tableName: 'countries',
  changesets: function () {
    return this.belongsToMany(Changeset);
  }
});
