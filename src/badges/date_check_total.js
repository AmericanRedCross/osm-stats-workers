var R = require('ramda');

module.exports = function (dates) {
  var badges = {
    daysTotal: {
      name: 'Year-Long Mapper',
      id: 15,
      tiers: {1: 25, 2: 50, 3: 100}
    }
  };

  function checkBadgeLevel (uniqueDates, badge) {
    var uniqueDatesLength = uniqueDates.length;
    if (uniqueDatesLength >= badge.tiers[1] && uniqueDatesLength < badge.tiers[2]) {
      return 1;
    } else if (uniqueDatesLength >= badge.tiers[2] && uniqueDatesLength < badge.tiers[3]) {
      return 2;
    } else if (uniqueDatesLength >= badge.tiers[3]) {
      return 3;
    } else {
      return null;
    }
  }

  // Truncate hours/minutes/seconds from timestamp
  dates = dates.map(function (date) {
    date = new Date(date);
    return date.setHours(0, 0, 0, 0);
  });

  // Get unique dates and check badge level
  var uniqueDates = R.uniq(dates);
  var badgeLevel = checkBadgeLevel(uniqueDates, badges.daysTotal);

  var earnedBadges = {};
  if (badgeLevel !== null) {
    earnedBadges['yearlongmapper'] = {category: 15, level: badgeLevel};
  }

  return earnedBadges;
};
