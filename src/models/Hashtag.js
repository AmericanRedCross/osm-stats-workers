var bookshelf = require('../common/bookshelf_init');
require('./Changeset');

// Returns Hashtag model
var Hashtag = bookshelf.Model.extend({
  tableName: 'hashtags',
  changesets: function () {
    return this.belongsToMany('Changeset');
  }
});

module.exports = bookshelf.model('Hashtag', Hashtag);
