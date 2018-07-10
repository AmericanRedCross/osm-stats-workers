#!/usr/bin/env bash

while true; do
  date
  timeout 30m npm run housekeeping
  timeout 30m npm run update-badges
done
