#!/usr/bin/env bash
set -e # halt script on error

mkdir -p deploy
zip -r deploy/osm-stats-workers.zip *
