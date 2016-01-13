#!/bin/bash

dropdb missingmaps
createdb missingmaps
cd src/db/migrations
knex migrate:latest
cd seeds
knex seed:run
cd ../../../..