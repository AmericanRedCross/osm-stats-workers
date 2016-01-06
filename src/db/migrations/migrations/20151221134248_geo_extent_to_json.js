exports.up = function (knex, Promise) {
  knex.raw('ALTER TABLE users ALTER COLUMN geo_extent TYPE json USING geo_extent::json');
};

exports.down = function (knex, Promise) {
};
