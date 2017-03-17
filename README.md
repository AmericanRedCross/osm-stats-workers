# osm-stats-workers

Contains the data processing workers used to calculate metrics tracked by the [OSM-Stats](https://github.com/AmericanRedCross/osm-stats) from OSM changeset JSON. Calculations are stored in a database to be accessed via an API connected to the front end site.

Each metric which requires calculation rather than a simple lookup should be saved as a function in src/metrics, with common components in src/common. Each function should be given a test in the test directory.
