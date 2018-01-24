const R = require("ramda");

const BADGES = {
  daysInRow: {
    name: "Consistency",
    id: 14,
    tiers: { 1: 5, 2: 20, 3: 50 }
  }
};

// function takes array of dates and returns an array of arrays
// containing each sequential date
// http://stackoverflow.com/questions/16690905/javascript-get-sequential-dates-in-array
function sequentializeDates(dates) {
  // Filter out non-unique dates
  const uniqueDates = R.uniq(
    dates.map(date => new Date(date).setHours(0, 0, 0, 0))
  );

  let k = 0;
  const sorted = [];
  sorted[k] = [];

  uniqueDates.sort((a, b) => a - b).forEach((v, i) => {
    const a = v;
    const b = uniqueDates[i + 1] || 0;
    sorted[k].push(+a);

    if (b - a > 86400e3) {
      sorted[++k] = [];
    }
  });

  return sorted.sort((a, b) => a.length - b.length);
}

function checkBadgeLevel(sequentialDates, badge) {
  for (let i = 0; i < sequentialDates.length; ++i) {
    const dayStreakLength = sequentialDates[i].length;

    if (dayStreakLength >= badge.tiers[1] && dayStreakLength < badge.tiers[2]) {
      return 1;
    }

    if (dayStreakLength >= badge.tiers[2] && dayStreakLength < badge.tiers[3]) {
      return 2;
    }

    if (dayStreakLength >= badge.tiers[3]) {
      return 3;
    }
  }
}

module.exports = dates => {
  const sequentialDates = sequentializeDates(dates);
  const badgeLevel = checkBadgeLevel(sequentialDates, BADGES.daysInRow);

  const earnedBadges = {};

  if (badgeLevel != null) {
    earnedBadges.consistency = {
      category: 14,
      level: badgeLevel
    };
  }

  return earnedBadges;
};
