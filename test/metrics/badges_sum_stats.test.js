var fs = require('fs');
var tap = require('tap');
var sumCheck = require('../../src/badges/sum_check');
var sumStats = JSON.parse(fs.readFileSync('test/fixtures/badges/sum_stats.json'));

var userWithNoBadges = sumStats.user_with_no_badges;
var userWithTierOneBadges = sumStats.user_with_tier1_badges;
var userWithTierTwoBadges = sumStats.user_with_tier2_badges;
var userWithTierThreeBadges = sumStats.user_with_tier3_badges;

// note: road counts and road mod counts were removed
tap.test('badge logic - sum metrics', function (t) {
  t.deepEqual(sumCheck(userWithNoBadges), {}, 'a user with all <level 1 metrics should return an empty object');

  t.deepEqual(sumCheck(userWithTierOneBadges), {
    // roads: { category: 1, level: 1 },
    // roadMods: { category: 2, level: 1 },
    pois: { category: 3, level: 1 },
    buildings: { category: 4, level: 1 },
    gpsTraces: { category: 5, level: 1 },
    roadKms: { category: 6, level: 1 },
    roadKmMods: { category: 7, level: 1 },
    waterways: { category: 8, level: 1 },
    countries: { category: 9, level: 1 },
    tasks: { category: 10, level: 1 },
    taskEdits: { category: 11, level: 1 },
    josm: { category: 12, level: 1 },
    hashtags: { category: 13, level: 1 }
  }, 'a user with all level 1 metrics should return object of badge keys with all 1s');

  t.deepEqual(sumCheck(userWithTierTwoBadges), {
    // roads: { category: 1, level: 2 },
    // roadMods: { category: 2, level: 2 },
    pois: { category: 3, level: 2 },
    buildings: { category: 4, level: 2 },
    gpsTraces: { category: 5, level: 2 },
    roadKms: { category: 6, level: 2 },
    roadKmMods: { category: 7, level: 2 },
    waterways: { category: 8, level: 2 },
    countries: { category: 9, level: 2 },
    tasks: { category: 10, level: 2 },
    taskEdits: { category: 11, level: 2 },
    josm: { category: 12, level: 2 },
    hashtags: { category: 13, level: 2 }
  }, 'a user with all level 2 metrics should return object of badge keys with all 2s');

  t.deepEqual(sumCheck(userWithTierThreeBadges), {
    // roads: { category: 1, level: 3 },
    // roadMods: { category: 2, level: 3 },
    pois: { category: 3, level: 3 },
    buildings: { category: 4, level: 3 },
    gpsTraces: { category: 5, level: 3 },
    roadKms: { category: 6, level: 3 },
    roadKmMods: { category: 7, level: 3 },
    waterways: { category: 8, level: 3 },
    countries: { category: 9, level: 3 },
    tasks: { category: 10, level: 3 },
    taskEdits: { category: 11, level: 3 },
    josm: { category: 12, level: 3 },
    hashtags: { category: 13, level: 3 }
  }, 'a user with all level 3 metrics should return object of badge keys with all 3s');

  t.end();
});
