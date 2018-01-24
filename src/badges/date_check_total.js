const R = require("ramda");

const BADGES = {
  daysTotal: {
    name: "Year-Long Mapper",
    id: 15,
    tiers: { 1: 25, 2: 50, 3: 100 }
  }
};

function checkBadgeLevel(uniqueDates, badge) {
  const uniqueDatesLength = uniqueDates.length;
  if (
    uniqueDatesLength >= badge.tiers[1] &&
    uniqueDatesLength < badge.tiers[2]
  ) {
    return 1;
  }

  if (
    uniqueDatesLength >= badge.tiers[2] &&
    uniqueDatesLength < badge.tiers[3]
  ) {
    return 2;
  }

  if (uniqueDatesLength >= badge.tiers[3]) {
    return 3;
  }
}

module.exports = dates => {
  // Truncate hours/minutes/seconds from timestamp
  const truncatedDates = dates.map(date => new Date(date).setHours(0, 0, 0, 0));

  // Get unique dates and check badge level
  const uniqueDates = R.uniq(truncatedDates);
  const badgeLevel = checkBadgeLevel(uniqueDates, BADGES.daysTotal);

  const earnedBadges = {};

  if (badgeLevel != null) {
    earnedBadges.yearlongmapper = {
      category: 15,
      level: badgeLevel
    };
  }

  return earnedBadges;
};
