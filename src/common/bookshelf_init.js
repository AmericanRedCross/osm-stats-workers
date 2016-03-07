var knex = require('./db_connection_knex.js');
var bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');
var jsonColumns = require('bookshelf-json-columns');

bookshelf.plugin(jsonColumns);

module.exports = bookshelf;
