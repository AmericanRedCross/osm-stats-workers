var knex = require('./db_connection_knex.js');
var bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

module.exports = bookshelf;
