exports.up = function (knex, Promise) {
  return knex.schema
    .createTable('users', function (table) {
      table.integer('id').primary();
      table.string('name');
      table.string('avatar');
      table.json('geo_extent');
      table.timestamp('created_at');
    })
    .createTable('changesets', function (table) {
      table.integer('id').primary();
      table.integer('road_count');
      table.integer('building_count');
      table.integer('waterway_count');
      table.integer('poi_count');
      table.integer('gpstrace_count');
      table.integer('road_km');
      table.integer('waterway_km');
      table.integer('gpstrace_km');
      table.string('editor');
      table.integer('user_id').references('users.id');
      table.timestamp('created_at');
    })
    .createTable('hashtags', function (table) {
      table.increments('id').primary();
      table.string('hashtag');
      table.timestamp('created_at');
    })
    .createTable('changesets_hashtags', function (table) {
      table.increments('id').primary();
      table.integer('changeset_id').references('changesets.id');
      table.integer('hashtag_id').references('hashtags.id');
    })
    .createTable('countries', function (table) {
      table.increments('id').primary();
      table.string('name');
      table.string('code');
      table.timestamp('created_at');
    })
    .createTable('changesets_countries', function (table) {
      table.increments('id').primary();
      table.integer('changeset_id').references('changesets.id');
      table.integer('country_id').references('countries.id');
    })
    .createTable('badges', function (table) {
      table.increments('id').primary();
      table.string('name');
      table.string('description');
      table.text('requirements');
      table.timestamps();
    })
    .createTable('users_badges', function (table) {
      table.increments('id').primary();
      table.integer('user_id').references('users.id');
      table.integer('badge_id').references('badges.id');
    });
};

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTable('badges')
    .dropTable('users_badges')
    .dropTable('countries')
    .dropTable('changesets_countries')
    .dropTable('hashtags')
    .dropTable('chagesets_hashtags')
    .dropTable('changesets')
    .dropTable('users');
};
