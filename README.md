# osm-stats-workers

Contains the data processing workers used to calculate metrics tracked by the [OSM-Stats](https://github.com/AmericanRedCross/osm-stats) from OSM changeset JSON. Calculations are stored in a database to be accessed via an API connected to the front end site.

Each metric which requires calculation rather than a simple lookup should be saved as a function in src/metrics, with common components in src/common. Each function should be given a test in the test directory.

## Getting it running

A `docker-compose.yml` is included that will start up a PostgreSQL database and the `bin/osm-changes.js` worker, which is responsible for reading augmented diffs from the Overpass API, summarizing them, and writing them into various database tables. (Note: this does *not* include refreshing materialized views, so if osm-stats-api is wired up, data will appear out-of-date (or be empty).

```bash
docker-compose up
```

To initialize the database, run `DATABASE_URL=... make db/all` against the running database. (I'm hand waving here slightly, as the `stats` container doesn't include the PostgreSQL CLI (though it could, via `apt`) and the database port isn't exposed.)

Once the database has been initialized, update the `augmented_diff_status` and `changesets_status` tables to provide starting points for Overpass augmented diff sequences and changeset sequences (from planet.osm.org) respectively.
