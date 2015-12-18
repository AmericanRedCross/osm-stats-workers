/* global L */
var Simulator = require('./simulator.js');
var buildingCount = require('../../src/metrics/building_count');
var riverCount = require('../../src/metrics/river_count');
var roadCount = require('../../src/metrics/road_count');
var poiCount = require('../../src/metrics/poi_count');
var kmRoad = require('../../src/metrics/road_length');
var kmRiver = require('../../src/metrics/river_length');
var simulation = new Simulator();

L.mapbox.accessToken = 'pk.eyJ1Ijoia2FtaWN1dCIsImEiOiJMVzF2NThZIn0.WO0ArcIIzYVioen3HpfugQ';
var map = L.mapbox.map('map', 'mapbox.streets')
    .setView([40, -74.50], 9);

var stats = document.getElementById('stats');

function addChangeset () {
  var changeset = simulation.randomChangeset();
  var geojsonDiff = {
    'type': 'FeatureCollection',
    'features': [],
    'properties': changeset.metadata
  };
  geojsonDiff.features = changeset.elements.filter(function (element) {
    return element.type === 'way' || (element.type === 'node' && element.tags && element.tags.amenity);
  }).map(toGeojson);
  console.log(geojsonDiff);

  var geojsonLayer = L.geoJson().addTo(map);
  geojsonLayer.addData(geojsonDiff);
  map.fitBounds(geojsonLayer.getBounds(), {maxZoom: 16});

  stats.innerHTML = '<h2> Changes by ' + changeset.metadata.user + '</h2>' +
  '<ul>' +
  '<li> hashtag: ' + changeset.metadata.comment + '</li>' +
  '<li> buildings edited: ' + buildingCount(changeset) + '</li>' +
  '<li> roads edited: ' + roadCount(changeset) + '</li>' +
  '<li> rivers edited: ' + riverCount(changeset) + '</li>' +
  '<li> poi edited: ' + poiCount(changeset) + '</li>' +
  '<li> roads added: ' + (1000 * kmRoad(changeset)).toFixed(2) + ' m. </li>' +
  '<li> rivers added: ' + (1000 * kmRiver(changeset)).toFixed(2) + ' m. </li>' +
  '</ul>';
}

setInterval(addChangeset, 3000);

function toGeojson (diffEl) {
  if (diffEl.type === 'node') {
    return {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [diffEl.lon, diffEl.lat],
        'properties': {
          'tags': diffEl.tags
        }
      }
    };
  }
  var properties = {};
  properties.id = diffEl.id;
  properties.timestamp = diffEl.timestamp;
  properties.changeset = diffEl.changeset;
  properties.user = diffEl.user;
  properties.tags = diffEl.tags;

  var geo = {
    'type': 'Feature',
    'geometry': {
      'type': 'LineString',
      'coordinates': []
    },
    'properties': properties
  };
  if (diffEl.action === 'create' || diffEl.action === 'modify') {
    var nodelist = diffEl.nodes.map(function (node) {
      return [node.lon, node.lat];
    });
    var first = nodelist[0];
    var last = nodelist[nodelist.length - 1];
    if (first[0] === last[0] && first[1] === last[1]) {
      geo.geometry.coordinates = [nodelist];
      geo.geometry.type = 'Polygon';
    } else {
      geo.geometry.coordinates = nodelist;
    }
  }
  return geo;
}
