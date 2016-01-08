exports.seed = function (knex, Promise) {
  return Promise.join(
    // Deletes ALL existing entries
    knex('badges').del(),

    // Inserts seed entries
    knex('badges').insert([
      {'id': 1, 'name': 'Road Builder', 'created_at': new Date()},
      {'id': 2, 'name': 'Road Maintainer', 'created_at': new Date()},
      {'id': 3, 'name': 'Point Creator', 'created_at': new Date()},
      {'id': 4, 'name': 'Building Builder', 'created_at': new Date()},
      {'id': 5, 'name': 'GPS Trace Creator', 'created_at': new Date()},
      {'id': 6, 'name': 'Long & Winding Road', 'created_at': new Date()},
      {'id': 7, 'name': 'Long & Winding Road Maintainer', 'created_at': new Date()},
      {'id': 8, 'name': 'Waterway Creator', 'created_at': new Date()},
      {'id': 9, 'name': 'World Renown', 'created_at': new Date()},
      {'id': 10, 'name': 'TaskMan Square Champion', 'created_at': new Date()},
      {'id': 11, 'name': 'TaskMan Scrutinizer', 'created_at': new Date()},
      {'id': 12, 'name': 'JOSM User', 'created_at': new Date()},
      {'id': 13, 'name': 'Mapathoner', 'created_at': new Date()},
      {'id': 14, 'name': 'Consistency', 'created_at': new Date()},
      {'id': 15, 'name': 'Year-long Mapper', 'created_at': new Date()},
      {'id': 16, 'name': 'Crisis Mapping', 'created_at': new Date()},
      {'id': 17, 'name': 'Red Cross Mapper', 'created_at': new Date()},
      {'id': 18, 'name': 'MSF Mapper', 'created_at': new Date()}
    ])
  );
};
