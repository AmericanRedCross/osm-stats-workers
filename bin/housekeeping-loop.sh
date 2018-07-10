#!/usr/bin/env bash

while true; do
  date
  timeout 2h npm run housekeeping
  timeout 2h npm run update-badges
done
