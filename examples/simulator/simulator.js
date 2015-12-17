var Chance = require('chance');
var chance = new Chance();
var R = require('ramda');
var moment = require('moment');

// Global
var thingsToDo = ['highway', 'river', 'building', 'amenity'];
var amenities = ['hospital', 'drinking_water', 'clinic', 'school', 'bus_station', 'pharmacy'];
var actions = ['create', 'modify'];

function Simulation () {
  // Generate users
  var stripWhitespace = R.compose(R.join(''), R.split(' '));
  this.users = R.map(stripWhitespace, chance.n(chance.name, 20));
  this.ref = chance.natural();
  this.centers = R.times(mapathon, 10);
  this.m = moment();
}

// Changeset stub
function stub () {
  return {
    metadata: {},
    elements: []
  };
}

function mapathon () {
  return {lat: chance.latitude(), lon: chance.longitude(), hashtag: chance.hashtag()};
}

// Creates a node at a max of 3 deg from center
Simulation.prototype.editNode = function (opts) {
  if (!opts.center) throw Error('node needs a center');
  var center = opts.center;
  var dlat = opts.dlat || chance.floating({min: -0.3, max: 0.3});
  var dlon = opts.dlon || chance.floating({min: -0.3, max: 0.3});
  var node = R.mapObj(R.toString, {
    id: this.ref,
    lat: center.lat + dlat,
    lon: center.lon + dlon
  });
  this.ref += 1;
  node.timestamp = this.m.toISOString();
  node.type = 'node';
  node.action = opts.action || 'create';
  return node;
};

// Creates a way
Simulation.prototype.editWay = function (opts) {
  var center = opts.center;
  if (!center) throw Error('way needs a center');
  var action = opts.action;
  var n = chance.natural({min: 4, max: 10});
  var dlat = chance.floating({min: -0.3, max: 0.3});
  var dlon = chance.floating({min: -0.3, max: 0.3});
  var elements = [];
  for (var i = 1; i <= n; i++) {
    elements.push(this.editNode({center: center,
                           dlon: dlon + i * 0.001,
                           dlat: dlat + i * 0.001,
                           action: action}));
  }
  var refs = elements.map(function (element) {
    return {
      ref: element.id,
      lat: element.lat,
      lon: element.lon
    };
  });

  var way = {
    timestamp: elements[0].timestamp,
    action: action,
    type: 'way',
    nodes: refs
  };

  // Return the nodes along with the way
  if (action === 'create') {
    return R.concat([way], elements);
  } else {
    return [way];
  }
};

Simulation.prototype.editHighway = function (changeset, opts) {
  var elements = this.editWay(R.pick(['action', 'center'], opts));
  elements[0].tags = {
    'highway': 'yes'
  };
  changeset.elements = R.concat(changeset.elements, elements);
  return changeset;
};

Simulation.prototype.editRiver = function (changeset, opts) {
  var elements = this.editWay(R.pick(['action', 'center'], opts));
  elements[0].tags = {
    'waterway': 'river'
  };
  changeset.elements = R.concat(changeset.elements, elements);
  return changeset;
};

Simulation.prototype.editAmenity = function (changeset, opts) {
  var element = this.editNode(R.pick(['action', 'center'], opts));
  element.tags = {
    'amenity': chance.pick(amenities)
  };
  changeset.elements.push(element);
  return changeset;
};

// Creates a closed way for buildings
Simulation.prototype.editClosedWay = function (opts) {
  var center = opts.center;
  if (!center) throw Error('way needs a center');
  var action = opts.action;
  var dlat = chance.floating({min: -0.1, max: 0.1});
  var dlon = chance.floating({min: -0.1, max: 0.1});
  var elements = [];
  var prec = 0.00001;
  elements.push(this.editNode({center: center, dlon: dlon, dlat: dlat, action: action}));
  elements.push(this.editNode({center: center, dlon: dlon + prec, dlat: dlat, action: action}));
  elements.push(this.editNode({center: center, dlon: dlon + prec, dlat: dlat + prec, action: action}));
  elements.push(this.editNode({center: center, dlon: dlon, dlat: dlat + prec, action: action}));
  elements.push(this.editNode({center: center, dlon: dlon, dlat: dlat, action: action}));
  var refs = elements.map(function (element) {
    return {
      ref: element.id,
      lat: element.lat,
      lon: element.lon
    };
  });

  var way = {
    timestamp: elements[0].timestamp,
    action: action,
    type: 'way',
    nodes: refs
  };

  // Return the nodes along with the way
  if (action === 'create') {
    return R.concat([way], elements);
  } else {
    return [way];
  }
};

Simulation.prototype.editBuilding = function (changeset, opts) {
  var elements = this.editClosedWay(R.pick(['action', 'center'], opts));
  elements[0].tags = {
    'building': 'yes'
  };
  changeset.elements = R.concat(changeset.elements, elements);
  return changeset;
};

Simulation.prototype.randomChangeset = function () {
  var changeset = stub();
  var center = chance.pick(this.centers);

  changeset.metadata.user = chance.pick(this.users);
  changeset.metadata.id = this.ref;
  this.ref += 1;
  changeset.metadata.comment = center.hashtag;

  for (var i = 0; i < chance.natural({min: 1, max: 10}); i++) {
    // Pick a thing to do
    var thing = chance.pick(thingsToDo);
    var opts = {action: chance.pick(actions), center: center};
    switch (thing) {
      case 'highway':
        changeset = this.editHighway(changeset, opts);
      break;
      case 'river':
        changeset = this.editRiver(changeset, opts);
      break;
      case 'building':
        changeset = this.editBuilding(changeset, opts);
      break;
      case 'amenity':
        changeset = this.editAmenity(changeset, opts);
      break;
      default:
        break;
    }
  }
  return changeset;
};

module.exports = Simulation;
