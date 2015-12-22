var bookshelf = require('../common/bookshelf_init');
require('./User');

// Returns Badge model
var Badge = bookshelf.Model.extend({
  tableName: 'badges',
  users: function () {
    return this.belongToMany('User');
  }
});

module.exports = bookshelf.model('Badge', Badge);
