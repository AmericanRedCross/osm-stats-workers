var badges = {
  daysInRow: {
    name: 'Consistency',
    id: 14,
    tiers: {1: 5, 2: 20, 3: 50}
  },
  daysTotal: {
    name: 'Year Long Mapper',
    id: 15,
    tiers: {1: 25, 2: 50, 3: 100}
  }
};

Object.keys(badges).forEach(function (key) {
  console.log(key, badges[key]);
});
