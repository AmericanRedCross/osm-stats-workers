var bookshelf = require('../common/bookshelf_init');
require('./User');
require('./Hashtag');
require('./Country');

// Returns Changeset model
var Changeset = bookshelf.Model.extend({
  tableName: 'changesets',
  users: function () {
    return this.belongsTo('User');
  },
  hashtags: function () {
    return this.belongsToMany('Hashtag');
  },
  countries: function () {
    return this.belongsToMany('Country');
  }
}, {
  createChangesetIfNotExists: function (metrics, transaction) {
    return Changeset.where({id: metrics.id}).fetch().then(function (result) {
      if (!result) {
        return Changeset.forge({
          id: metrics.id,
          road_count_add: metrics.metrics.road_count,
          road_count_mod: metrics.metrics.road_count_mod,
          building_count_add: metrics.metrics.building_count,
          building_count_mod: metrics.metrics.building_count_mod,
          waterway_count_add: metrics.metrics.waterway_count,
          poi_count_add: metrics.metrics.poi_count,
          // GPS trace not yet implemented
          gpstrace_count_add: 0,
          road_km_add: metrics.metrics.road_km,
          road_km_mod: metrics.metrics.road_km_mod,
          waterway_km_add: metrics.metrics.waterway_km,
          // GPS trace not yet implemented
          gpstrace_km_add: 0,
          editor: metrics.editor,
          user_id: metrics.user.id,
          created_at: new Date(metrics.created_at)
        }).save(null, {method: 'insert', transacting: transaction});
      } else {
        throw new Error('Changeset exists');
      }
    });
  }
});

module.exports = bookshelf.model('Changeset', Changeset);
