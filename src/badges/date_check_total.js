// this is a placeholder for the object

var badges = {
  daysTotal: {
    name: 'Year Long Mapper',
    id: 15,
    tiers: {1: 25, 2: 50, 3: 100}
  }
};

Object.keys(badges).forEach(function (key) {
  console.log(key, badges[key]);
});
