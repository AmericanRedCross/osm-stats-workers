var knex = require('knex')({
  client: 'pg',
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'missingmaps'
  }
});
var bookshelf = require('bookshelf')(knex);

var Changeset = bookshelf.Model.extend({
  tableName: 'changesets',
  users: function () {
    return this.belongsTo(User); // many2one with users
  },
  hashtags: function () {
    return this.belongsToMany(Hashtag);  // m2m with hashtags
  },
  countries: function () {
    return this.belongsToMany(Country); // m2m with countries
  }
});

var Hashtag = bookshelf.Model.extend({
  tablename: 'hashtags',
  hashtags: function () {
    return this.belongsToMany(Changeset); // m2m with changesets
  }
});

var User = bookshelf.Model.extend({
  tableName: 'users',
  changesets: function () {
    return this.hasMany(Changeset); // one2many with changesets
  },
  badges: function () {
    this.belongsToMany(Badge); // m2m with badges
  }
});

var Country = bookshelf.Model.extend({
  tableName: 'countries',
  changesets: function () {
    return this.belongsToMany(Changeset); // m2m with changesets
  }
});

var Badge = bookshelf.Model.extend({
  tableName: 'badges',
  users: function () {
    return this.belongToMany(User); // m2m with users
  }
});

module.exports.Changeset = Changeset;
module.exports.Hashtag = Hashtag;
module.exports.User = User;
module.exports.Country = Country;
module.exports.Badge = Badge;
