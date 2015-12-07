var turf = require('turf');
var fs = require('fs');
// var geocoder = require('country-reverse-geocoding').country_reverse_geocoding();

var data = JSON.parse(fs.readFileSync('test/example.json', 'utf8'));

function connectMissingMapsDB () {
  var knex = require('knex')({
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: '',
      database: 'missingmaps2'
    }
  });
  return knex;
}

// Extract a property from an object
function popProperty (data, property) {
  var result = data[property];
  if (!delete data[property]) throw new Error();
  return result;
}

// Convert 'nodes' property from OSM object to
// GeoJSON LineString
function nodesToLine (nodes) {
  nodes = nodes.map(function (node) {
    return [node.lon, node.lat];
  });
  return {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'LineString',
      'coordinates': nodes
    }
  };
}

// Measures the total length of an array of OSM
// features, assuming that each of their nodes is a
// point on a line segment.
function measureTotalLength (features) {
  // A for loop is apparently much faster than summing
  // through semantic functions.
  // totalLength = 0;
  // for(var f = 0; f < features.length; f++) {
  //   var line = nodesToLine(features[f].nodes);
  //   var length = turf.lineDistance(line, 'kilometers');
  //   totalLength += length;
  // };
  var length = features
    // Map individual line distances
    .map(function (segment) {
      var line = nodesToLine(segment.nodes);
      return turf.lineDistance(line, 'kilometers');
    })
    // Sum line distances
    .reduce(function (a, b) {
      return a + b;
    });
  return length;
}

// Connect to missing maps database
var knex = connectMissingMapsDB();

// Split OSM data into elements and metadata
var elements = popProperty(data, 'elements');
var metadata = data.metadata;

// var userId = metadata.uid;

// Get highway statistics (count and total length)
var highways = elements.filter(function (element) {
  return element.tags.highway === 'yes';
});
var highwayCount = highways.length;
var highwayLength = measureTotalLength(highways);

// Get waterway statistics (count and total length)
var waterways = elements.filter(function (element) {
  return element.tags.waterway === 'yes';
});
var waterwayCount = waterways.length;
var waterwayLength = measureTotalLength(waterways);

// Get building count count
var buildingCount = elements.filter(function (element) {
  return element.tags.building === 'yes';
}).length;

// Looks up country at centroid of changeset
// function reverseGeocodeCountry (metadata) {
//   var lat = (+metadata.min_lat + +metadata.max_lat) / 2;
//   var lon = (+metadata.min_lon + +metadata.max_lon) / 2;
//   return geocoder.get_country(lat, lon).name;
// }

// var country = reverseGeocodeCountry(metadata);

function checkId (table, value) {
  return knex(table).select('id').where({id: value});
}

function addUser () {
  return checkId('osmuser', metadata.uid).then(function (users) {
    if (users.length === 0) {
      return knex.insert(
        {
          id: metadata.uid,
          name: metadata.user
        })
        .into('osmuser');
    }
    else console.log('user exists');
  });
}

function insertChangeset () {
  return addUser().then(function () {
    return knex('changeset').insert(
      {
        id: metadata.id,
        road_count: highwayCount,
        building_count: buildingCount,
        waterway_count: waterwayCount,
        poi_count: 0,
        gps_trace_count: 0,
        road_km: ~~(highwayLength * 100),
        waterway_km: ~~(waterwayLength * 100),
        gps_trace_km: ~~(0 * 100),
        editor: metadata.created_by,
        osmuser_id: metadata.uid,
        date_created: metadata.created_at
      })
      .into('changeset')
      .then(function (id) {
        console.log('updated ' + id);
      });
  });
}

insertChangeset();

