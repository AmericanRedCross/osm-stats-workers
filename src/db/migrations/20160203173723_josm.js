exports.up = function (knex, Promise) {
  return knex.schema.table('users', function (table) {
    table.decimal('total_josm_edit_count', 40, 20);
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('total_josm_edit_count');
  });
};
