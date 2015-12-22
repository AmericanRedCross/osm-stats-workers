var bookshelf = require('../common/bookshelf_init');
var Changeset = require('./Changeset');

// Returns Country model
module.exports = bookshelf.Model.extend({
  tableName: 'countries',
  changesets: function () {
    return this.belongsToMany(Changeset);
  }
});
