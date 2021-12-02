#!/usr/bin/env bash

while true; do
  date
  npm run housekeeping
  npm run update-badges
done
