const tap = require("tap");
const totalDateCheck = require("../../src/badges/date_check_total");
const dates = require("../fixtures/badges/date_stats_total.json");

const userWithNoBadges = dates.user_with_no_badges;
const userWithTierOneBadges = dates.user_with_tier1_badges;
const userWithTierTwoBadges = dates.user_with_tier2_badges;
const userWithTierThreeBadges = dates.user_with_tier3_badges;

tap.test("badge logic - total date metrics", t => {
  t.deepEqual(
    totalDateCheck(userWithNoBadges),
    {},
    "a user with <25 unique dates should return an empty object"
  );

  t.deepEqual(
    totalDateCheck(userWithTierOneBadges),
    { yearlongmapper: { category: 15, level: 1 } },
    "a user with 25-49 unique dates should return {yearlongmapper: {category: 15, level: 1}}"
  );

  t.deepEqual(
    totalDateCheck(userWithTierTwoBadges),
    { yearlongmapper: { category: 15, level: 2 } },
    "a user with 50-99 sequential dates should return {yearlongmapper: {category: 15, level: 2}}"
  );

  t.deepEqual(
    totalDateCheck(userWithTierThreeBadges),
    { yearlongmapper: { category: 15, level: 3 } },
    "a user with 100+ sequential dates should return {yearlongmapper: {category: 15, level: 3}}"
  );

  t.end();
});
