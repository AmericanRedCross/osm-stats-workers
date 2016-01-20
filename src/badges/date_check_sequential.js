module.exports = function (dates) {
  var badges = {
    daysInRow: {
      name: 'Consistency',
      id: 14,
      tiers: {1: 5, 2: 20, 3: 50}
    }
  };

  // function takes array of dates and returns an array of arrays
  // containing each sequential date
  // http://stackoverflow.com/questions/16690905/javascript-get-sequential-dates-in-array
  function sequentializeDates (dates) {
    var k = 0;
    var sorted = [];
    sorted[k] = [];
    dates.sort(function (a, b) {
      return +a > +b ? 1 : +a === +b ? 0 : -1;
    })
    .forEach(function (v, i) {
      var a = v;
      var b = dates[i + 1] || 0;
      sorted[k].push(+a);
      if ((+b - +a) > 86400000) {
        sorted[++k] = [];
      }
      return 1;
    });
    sorted.sort(function (a, b) {
      return a.length > b.length ? -1 : 1;
    });
    return sorted;
  }

  function checkBadgeLevel (sequentialDates, badge) {
    for (var i = 0; i < sequentialDates.length; ++i) {
      var dayStreakLength = sequentialDates[i].length;
      if (dayStreakLength >= badge.tiers[1] && dayStreakLength < badge.tiers[2]) {
        return 1;
      } else if (dayStreakLength >= badge.tiers[2] && dayStreakLength < badge.tiers[3]) {
        return 2;
      } else if (dayStreakLength >= badge.tiers[3]) {
        return 3;
      } else {
        return null;
      }
    }
  }

  var sequentialDates = sequentializeDates(dates);
  var badgeLevel = checkBadgeLevel(sequentialDates, badges.daysInRow);

  var earnedBadges = {};
  if (badgeLevel !== null) {
    earnedBadges['consistency'] = {category: 14, level: badgeLevel};
  }

  return earnedBadges;
};
