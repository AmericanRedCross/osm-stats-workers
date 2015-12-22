var bookshelf = require('../common/bookshelf_init');
require('./Changeset');
require('./Badge');

// Returns User model
var User = bookshelf.Model.extend({
  tableName: 'users',
  changesets: function () {
    return this.hasMany('Changeset');
  },
  badges: function () {
    this.belongsToMany('Badge');
  }
});

module.exports = bookshelf.model('User', User);
