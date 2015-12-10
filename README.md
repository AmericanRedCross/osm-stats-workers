### OSM-Gamification Workers

Contains the data processing workers used to calculate metrics tracked by the [OSM-Gamification site](https://github.com/developmentseed/osm-gamification) from OSM changeset JSON. Calculations are stored in a database to be accessed via an API connected to the front end site.

Each metric which requires calculation rather than a simple lookup should be saved as a function in src/metrics, with common components in src/common. Each function should be given a test in the test directory.

The database ORM is Bookshelf.js. To initialize the database schema, first install knex with cli
```
npm install knex -g -s
```

then run
```
knex migrate:latest
```

from the src/db/migrations directory.

Timestamped migration templates can be generated using
```
knex migrate:make migration_name
```

and the src/db/migration_template.js contains the current snapshot of the schema.
