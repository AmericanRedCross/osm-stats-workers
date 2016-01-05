var bookshelf = require('../common/bookshelf_init');
var Changeset = require('./Changeset');

// Returns Country model
var Country = bookshelf.Model.extend({
  tableName: 'countries',
  changesets: function () {
    return this.belongsToMany(Changeset);
  }
});

module.exports = bookshelf.model('Country', Country);
