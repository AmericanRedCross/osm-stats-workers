#!/bin/bash

if dropdb missingmaps
  then
    echo "Dropping and rebuilding missingmaps DB."
  else
    echo "missingmaps DB does not exist. Building a new one."
fi
createdb missingmaps
knex migrate:latest --cwd ./src/db/migrations/
knex seed:run --cwd ./src/db/migrations/