var Chance = require('chance');
var chance = new Chance();
var R = require('ramda');
var moment = require('moment');

// Generate users
var stripWhitespace = R.compose(R.join(''), R.split(' '));
var users = R.map(stripWhitespace, chance.n(chance.name, 20));

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

// Seed
var ref = chance.natural();
var centers = R.times(mapathon, 10);
var m = moment();

// Things a user can do
var thingsToDo = ['highway', 'river', 'building', 'amenity'];

// Actions
var actions = ['create', 'modify'];

// Creates a node at a max of 3 deg from center
function editNode (opts) {
  if (!opts.center) throw Error('node needs a center');
  var center = opts.center;
  var dlat = opts.dlat || chance.floating({min: -0.3, max: 0.3});
  var dlon = opts.dlon || chance.floating({min: -0.3, max: 0.3});
  var node = R.mapObj(R.toString, {
    id: ref++,
    lat: center.lat + dlat,
    lon: center.lon + dlon
  });
  node.timestamp = m.toISOString();
  node.type = 'node';
  node.action = opts.action || 'create';
  return node;
}

// Creates a way
function editWay (opts) {
  var center = opts.center;
  if (!center) throw Error('way needs a center');
  var action = opts.action;
  var n = chance.natural({min: 4, max: 10});
  var dlat = chance.floating({min: -0.3, max: 0.3});
  var dlon = chance.floating({min: -0.3, max: 0.3});
  var elements = [];
  for (var i = 1; i <= n; i++) {
    elements.push(editNode({center: center,
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
}

function editHighway (changeset, opts) {
  var elements = editWay(R.pick(['action', 'center'], opts));
  elements[0].tags = {
    'highway': 'yes'
  };
  changeset.elements = R.concat(changeset.elements, elements);
  return changeset;
}

function editRiver (changeset, opts) {
  var elements = editWay(R.pick(['action', 'center'], opts));
  elements[0].tags = {
    'waterway': 'river'
  };
  changeset.elements = R.concat(changeset.elements, elements);
  return changeset;
}

var amenities = ['hospital', 'drinking_water', 'clinic', 'school', 'bus_station', 'pharmacy'];

function editAmenity (changeset, opts) {
  var element = editNode(R.pick(['action', 'center'], opts));
  element.tags = {
    'amenity': chance.pick(amenities)
  };
  changeset.elements.push(element);
  return changeset;
}

// Creates a closed way for buildings
function editClosedWay (opts) {
  var center = opts.center;
  if (!center) throw Error('way needs a center');
  var action = opts.action;
  var dlat = chance.floating({min: -0.1, max: 0.1});
  var dlon = chance.floating({min: -0.1, max: 0.1});
  var elements = [];
  var prec = 0.00001;
  elements.push(editNode({center: center, dlon: dlon, dlat: dlat, action: action}));
  elements.push(editNode({center: center, dlon: dlon + prec, dlat: dlat, action: action}));
  elements.push(editNode({center: center, dlon: dlon + prec, dlat: dlat + prec, action: action}));
  elements.push(editNode({center: center, dlon: dlon, dlat: dlat + prec, action: action}));
  elements.push(editNode({center: center, dlon: dlon, dlat: dlat, action: action}));
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
}

function editBuilding (changeset, opts) {
  var elements = editClosedWay(R.pick(['action', 'center'], opts));
  elements[0].tags = {
    'building': 'yes'
  };
  changeset.elements = R.concat(changeset.elements, elements);
  return changeset;
}

function randomChangeset () {
  var changeset = stub();
  var center = chance.pick(centers);

  changeset.metadata.user = chance.pick(users);
  changeset.metadata.id = ref++;
  changeset.metadata.comment = center.hashtag;

  for (var i = 0; i < chance.natural({min: 1, max: 10}); i++) {
    // Pick a thing to do
    var thing = chance.pick(thingsToDo);
    var opts = {action: chance.pick(actions), center: center};
    switch (thing) {
      case 'highway':
        changeset = editHighway(changeset, opts);
        break;
      case 'river':
        changeset = editRiver(changeset, opts);
        break;
      case 'building':
        changeset = editBuilding(changeset, opts);
        break;
      case 'amenity':
        changeset = editAmenity(changeset, opts);
        break;
      default:
        break;
    }
  }
  return changeset;
}

console.log(JSON.stringify(randomChangeset()));
