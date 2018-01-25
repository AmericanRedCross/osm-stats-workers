const BADGES = require(".");

function checkBadgeLevel(userTotal, badge) {
  if (userTotal >= badge.tiers[1] && userTotal < badge.tiers[2]) {
    return 1;
  }

  if (userTotal >= badge.tiers[2] && userTotal < badge.tiers[3]) {
    return 2;
  }

  if (userTotal >= badge.tiers[3]) {
    return 3;
  }
}

module.exports = data => Object.keys(data).reduce((acc, k) => {
  const badge = BADGES[k];

  if (badge == null) {
    return acc;
  }

  const level = checkBadgeLevel(data[k], badge);

  if (level != null) {
    acc[k] = {
      category: badge.id,
      level
    }
  }

  return acc;
}, {});
