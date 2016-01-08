var fs = require('fs');
var tap = require('tap');
var sumCheck = require('../../src/badges/sum_check');
var sumStats = JSON.parse(fs.readFileSync('test/fixtures/badges/sum_stats.json'));

var userWithNoBadges = sumStats.user_with_no_badges;
var userWithTierOneBadges = sumStats.user_with_tier1_badges;
var userWithTierTwoBadges = sumStats.user_with_tier2_badges;
var userWithTierThreeBadges = sumStats.user_with_tier3_badges;

tap.test('badge logic - sum metrics', function (t) {
  t.deepEqual(sumCheck(userWithNoBadges), {}, 'a user with all <level 1 metrics should return an empty object');

  t.deepEqual(sumCheck(userWithTierOneBadges), {
    roads: 1,
    roadMods: 1,
    pois: 1,
    buildings: 1,
    gpsTraces: 1,
    roadKms: 1,
    roadKmMods: 1,
    waterways: 1,
    countries: 1,
    tasks: 1,
    taskEdits: 1,
    josm: 1,
    hashtags: 1
  }, 'a user with all level 1 metrics should return object of badge keys with all 1s');

  t.deepEqual(sumCheck(userWithTierTwoBadges), {
    roads: 2,
    roadMods: 2,
    pois: 2,
    buildings: 2,
    gpsTraces: 2,
    roadKms: 2,
    roadKmMods: 2,
    waterways: 2,
    countries: 2,
    tasks: 2,
    taskEdits: 2,
    josm: 2,
    hashtags: 2
  }, 'a user with all level 2 metrics should return object of badge keys with all 2s');

  t.deepEqual(sumCheck(userWithTierThreeBadges), {
    roads: 3,
    roadMods: 3,
    pois: 3,
    buildings: 3,
    gpsTraces: 3,
    roadKms: 3,
    roadKmMods: 3,
    waterways: 3,
    countries: 3,
    tasks: 3,
    taskEdits: 3,
    josm: 3,
    hashtags: 3
  }, 'a user with all level 3 metrics should return object of badge keys with all 3s');

  t.end();
});
