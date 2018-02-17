const tap = require("tap");

const sequentialDateCheck = require("../../src/badges/date_check_sequential");
const sequentialDates = require("../fixtures/badges/date_stats_sequential.json");

const userWithNoBadges = sequentialDates.user_with_no_badges;
const userWithTierOneBadges = sequentialDates.user_with_tier1_badges;
const userWithTierTwoBadges = sequentialDates.user_with_tier2_badges;
const userWithTierThreeBadges = sequentialDates.user_with_tier3_badges;

tap.test("badge logic - sequential date metrics", t => {
  t.deepEqual(
    sequentialDateCheck(userWithNoBadges),
    {},
    "a user with <5 sequential dates should return an empty object"
  );

  t.deepEqual(
    sequentialDateCheck(userWithTierOneBadges),
    { consistency: { category: 14, level: 1 } },
    "a user with 5-19 sequential dates should return {consistency: {category: 14, level: 1}}"
  );

  t.deepEqual(
    sequentialDateCheck(userWithTierTwoBadges),
    { consistency: { category: 14, level: 2 } },
    "a user with 20-49 sequential dates should return {consistency: {category: 14, level: 2}}"
  );

  t.deepEqual(
    sequentialDateCheck(userWithTierThreeBadges),
    { consistency: { category: 14, level: 3 } },
    "a user with 50+ sequential dates should return {consistency: {category: 14, level: 3}}"
  );

  t.end();
});
