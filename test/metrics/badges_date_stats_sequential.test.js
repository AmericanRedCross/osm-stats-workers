var fs = require('fs');
var tap = require('tap');
var sequentialDateCheck = require('../../src/badges/date_check_sequential');
var sequentialDates = JSON.parse(fs.readFileSync('test/fixtures/badges/date_stats_sequential.json'));

var userWithNoBadges = sequentialDates.user_with_no_badges;
var userWithTierOneBadges = sequentialDates.user_with_tier1_badges;
var userWithTierTwoBadges = sequentialDates.user_with_tier2_badges;
var userWithTierThreeBadges = sequentialDates.user_with_tier3_badges;

tap.test('badge logic - sequential date metrics', function (t) {
  t.deepEqual(sequentialDateCheck(userWithNoBadges),
    {}, 'a user with <5 sequential dates should return an empty object');

  t.deepEqual(sequentialDateCheck(userWithTierOneBadges).consistency,
    1, 'a user with 5-19 sequential dates should return {consistency: 1}');

  t.deepEqual(sequentialDateCheck(userWithTierTwoBadges),
    {consistency: 2}, 'a user with 20-49 sequential dates should return {consistency: 2}');

  t.deepEqual(sequentialDateCheck(userWithTierThreeBadges),
    {consistency: 3}, 'a user with 50+ sequential dates should return {consistency: 3}');

  t.end();
});
