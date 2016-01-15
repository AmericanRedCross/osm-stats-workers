// Returns knex connection to the local
// missingmaps database
module.exports = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'missingmaps'
  }
});
