// Returns Bookshelf connection to the local
// missingmaps database
module.exports = require('knex')({
  client: 'pg',
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'missingmaps'
  }
});
