// Returns knex connection to the local
// missingmaps database

var knexConfig = require('../db/knexfile.js');
var db = process.env.NODE_ENV || 'development';
module.exports = require('knex')(knexConfig[db]);
