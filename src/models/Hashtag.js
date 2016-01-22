var bookshelf = require('../common/bookshelf_init');
var Promise = require('bluebird');
require('./Changeset');

// Returns Hashtag model
var Hashtag = bookshelf.Model.extend({
  tableName: 'hashtags',
  changesets: function () {
    return this.belongsToMany('Changeset');
  }
}, {
  createHashtags: function (hashtags, transaction) {
    return Promise.map(hashtags, function (hashtag) {
      return Hashtag.where('hashtag', hashtag).fetch({transacting: transaction})
      .then(function (result) {
        if (!result) {
          return Hashtag.forge({
            hashtag: hashtag,
            created_at: new Date()
          }).save(null, {method: 'insert', transacting: transaction});
        } else {
          return result;
        }
      });
    });
  }

});

module.exports = bookshelf.model('Hashtag', Hashtag);
