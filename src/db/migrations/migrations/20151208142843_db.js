exports.up = function (knex, Promise) {
  return knex.schema
    .createTable('users', function (table) {
      table.integer('id').primary();
      table.string('name');
      table.string('avatar');
      table.json('geo_extent');
      table.integer('total_road_count_add');
      table.integer('total_road_count_mod');
      table.integer('total_building_count_add');
      table.integer('total_building_count_mod');
      table.integer('total_waterway_count_add');
      table.integer('total_poi_count_add');
      table.integer('total_gpstrace_count_add');
      table.integer('total_road_km_add');
      table.integer('total_road_km_mod');
      table.integer('total_waterway_km_add');
      table.integer('total_gpstrace_km_add');
      table.timestamp('created_at');
    })
    .createTable('changesets', function (table) {
      table.integer('id').primary();
      table.integer('road_count_add');
      table.integer('road_count_mod');
      table.integer('building_count_add');
      table.integer('building_count_mod');
      table.integer('waterway_count_add');
      table.integer('poi_count_add');
      table.integer('gpstrace_count_add');
      table.integer('road_km_add');
      table.integer('road_km_mod');
      table.integer('waterway_km_add');
      table.integer('gpstrace_km_add');
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
      table.integer('id').primary();
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
      table.integer('category');
      table.string('name');
      table.integer('level');
      table.timestamp('created_at');
    })
    .createTable('badges_users', function (table) {
      table.increments('id').primary();
      table.integer('user_id').references('users.id');
      table.integer('badge_id').references('badges.id');
      table.timestamp('created_at').defaultTo(knex.raw('now()'));
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
