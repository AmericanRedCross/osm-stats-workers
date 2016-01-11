var bookshelf = require('../common/bookshelf_init');
require('./Changeset');
require('./Badge');
require('./Hashtag');

// Returns User model
var User = bookshelf.Model.extend({
  tableName: 'users',
  changesets: function () {
    return this.hasMany('Changeset');
  },
  badges: function () {
    return this.belongsToMany('Badge');
  },
  hashtags: function () {
    return this.hasMany('Hashtag').through('Changeset');
  }
});

module.exports = bookshelf.model('User', User);
