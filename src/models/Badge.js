var knex = require('../common/db_connection_knex');
var bookshelf = require('bookshelf')(knex);
var User = require('./User');

// Returns Badge model
module.exports = bookshelf.Model.extend({
  tableName: 'badges',
  users: function () {
    return this.belongToMany(User);
  }
});
