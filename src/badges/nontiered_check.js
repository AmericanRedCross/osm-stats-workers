var badges = {
  hotProjects: {
    name: 'Crisis Mapping',
    id: 16,
    tiers: {1: 10}
  },
  rcProjects: {
    name: 'Red Cross Mapper',
    id: 17,
    tiers: {1: 10}
  },
  msfProjects: {
    name: 'MSF Mapper',
    id: 18,
    tiers: {1: 10}
  }
};

Object.keys(badges).forEach(function (key) {
  console.log(key, badges[key]);
});
