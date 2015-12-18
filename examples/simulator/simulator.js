var Chance = require('chance');
var chance = new Chance();
var R = require('ramda');
var moment = require('moment');
var fs = require('fs');

// Global
var thingsToDo = ['highway', 'river', 'building', 'amenity'];
var amenities = ['hospital', 'drinking_water', 'clinic', 'school', 'bus_station', 'pharmacy'];
var actions = ['create', 'modify'];
var geojsonLayer = fs.readFileSync('./country_points.json');
var countries = JSON.parse(geojsonLayer).features;

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
  var country = chance.pick(countries);
  return {lat: country.geometry.coordinates[1], lon: country.geometry.coordinates[0], hashtag: chance.hashtag()};
}
console.log(mapathon());

// Creates a node at a max of 3 deg from center
Simulation.prototype.editNode = function (opts) {
  console.log(opts);
  if (!opts.center) throw Error('node needs a center');
  var center = opts.center;
  var lat = opts.lat || chance.floating({min: -0.03, max: 0.03});
  var lon = opts.lon || chance.floating({min: -0.03, max: 0.03});
  var node = R.mapObj(R.toString, {
    id: this.ref,
    lat: center.lat + lat,
    lon: center.lon + lon
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
  var n = chance.natural({min: 4, max: 25});
  var lat = chance.floating({min: -0.003, max: 0.003});
  var lon = chance.floating({min: -0.003, max: 0.003});
  var elements = [];

  var dlat = chance.floating({min: -0.00003, max: 0.00003});
  var dlon = chance.floating({min: -0.00003, max: 0.00003});

  for (var i = 1; i <= n; i++) {
    lat = lat + dlat ;
    lon = lon + dlon; 
    dlat = dlat + chance.floating({min: -0.00001, max: 0.00001});
    dlon = dlon + chance.floating({min: -0.00001, max: 0.00001});
    elements.push(this.editNode({center: center,
                           lon: lon,
                           lat: lat,
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
  var lat = chance.floating({min: 0.01, max: 0.02});
  var lon = chance.floating({min: 0.01, max: 0.02});
  var elements = [];
  var prec = 0.0001 * chance.natural({min: 1, max: 5});
  elements.push(this.editNode({center: center, lon: lon, lat: lat, action: action}));
  elements.push(this.editNode({center: center, lon: lon + prec, lat: lat, action: action}));
  elements.push(this.editNode({center: center, lon: lon + prec, lat: lat + prec, action: action}));
  elements.push(this.editNode({center: center, lon: lon, lat: lat + prec, action: action}));
  elements.push(this.editNode({center: center, lon: lon, lat: lat, action: action}));
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
