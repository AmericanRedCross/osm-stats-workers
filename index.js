var fs = require('fs');
var bookshelf = require('./src/common/bookshelf_init');
var R = require('ramda');
var Promise = require('bluebird');
var calculateMetrics = require('./src/calculate_metrics');

var changeset = JSON.parse(fs.readFileSync('./test/fixtures/example.json', 'utf8'));
var metrics = calculateMetrics(changeset);
var hashtags = getHashtags(changeset.metadata.comment);

var User = require('./src/models/User');
var Changeset = require('./src/models/Changeset');
var Hashtag = require('./src/models/Hashtag');

function createUserIfNotExists (user) {
  return User.where({id: user.id}).fetch().then(function (result) {
    if (!result) {
      return User.forge({
        id: user.id,
        name: user.name,
        geo_extent: user.geo_extent,
        avatar: user.avatar,
        created_at: new Date()
      }).save(null, {method: 'insert'});
    } else {
      return result.save({
        geo_extent: user.geo_extent
      });
    }
  });
}

function getHashtags (str) {
  if (!str) return [];
  var wordlist = str.split(' ');
  var hashlist = [];
  wordlist.forEach(function (word) {
    if (word.startsWith('#') && !R.contains(word, hashlist)) {
      word = word.trim();
      word = word.replace(/,\s*$/, '');
      hashlist.push(word.slice(1));
    }
  });
  return hashlist;
}

function createHashtags (hashtags) {
  return Promise.map(hashtags, function (hashtag) {
    return Hashtag.where('hashtag', hashtag).fetch()
    .then(function (result) {
      if (!result) {
        return Hashtag.forge({
          hashtag: hashtag,
          created_at: new Date()
        }).save();
      } else {
        return result;
      }
    });
  });
}

function addToDB (metrics) {
  return Changeset.forge({
    id: metrics.id,
    road_count: metrics.metrics.road_count,
    building_count: metrics.metrics.building_count,
    waterway_count: metrics.metrics.waterway_count,
    poi_count: metrics.metrics.poi_count,
    gpstrace_count: metrics.metrics.gpstrace_count,
    road_km: metrics.metrics.road_km,
    waterway_km: metrics.metrics.waterway_km,
    gpstrace_km: metrics.metrics.gpstrace_km,
    editor: metrics.editor,
    user_id: metrics.user.id,
    created_at: new Date(metrics.created_at)
  }).save(null, {method: 'insert'})
  .then(function (changeset) {
    return Promise.all([
      createUserIfNotExists(metrics.user),
      createHashtags(hashtags)
    ])
    .then(function (results) {
      var hashtags = results[1];
      return changeset.hashtags().attach(hashtags);
    })
    .catch(function (err) {
      console.error(err);
    });
  });
}

addToDB(metrics).then(function (results) {
  console.log(results);
});

// // Cannot seem to get model inserts working as functions
// // See line 71, 89, 89

// function addUser (t) {
//   return new User({
//   })
//   .save(null, {method: 'insert', transacting: t});
// }

// function addChangeset (t) {
//   return new Changeset({
//   })
//   .save(null, {method: 'insert', transacting: t});
// }

// function addHashtags (t, hashtags) {
//   return Promise.map(
//     metrics.hashtags, function (name) {
//       return new Hashtag({
//         hashtag: name,
//         created_at: new Date()
//       })
//     .save({}, {method: 'insert', transacting: t});
//     });
// }

function updateDB (metrics) {
  bookshelf.transaction(function (t) {
    return User.where('id', metrics.user.id).fetch()
    .then(function (model) {
      if (!model) {
        // addUser(t)
        return new User({
          id: metrics.user.id,
          name: metrics.user.name,
          avatar: metrics.user.avatar,
          geo_extent: metrics.user.geo_extent,
          created_at: new Date()
        })
        .save(null, {method: 'insert', transacting: t});
      } else {
        console.log('User ' + model.id + ' exists');
        return model;
      }
    })
    .then(function () {
      return Changeset.where('id', metrics.id).fetch()
      .then(function (model) {
        if (!model) {
          // addChangeset(t)
          return new Changeset({
            id: metrics.id,
            road_count: metrics.metrics.road_count,
            building_count: metrics.metrics.building_count,
            waterway_count: metrics.metrics.waterway_count,
            poi_count: metrics.metrics.poi_count,
            gpstrace_count: metrics.metrics.gpstrace_count,
            road_km: metrics.metrics.road_km,
            waterway_km: metrics.metrics.waterway_km,
            gpstrace_km: metrics.metrics.gpstrace_km,
            editor: metrics.editor,
            user_id: metrics.user.id,
            created_at: new Date(metrics.created_at)
          })
          .save(null, {method: 'insert', transacting: t});
        } else {
          throw new Error('Changeset ' + metrics.id + ' exists');
        }
      });
    })
    .tap(function (model) {
      // addHashtags(t, metrics.hashtags)
      return Promise.map(
        metrics.hashtags, function (name) {
          return new Hashtag({
            hashtag: name,
            created_at: new Date()})
            .save({}, {method: 'insert', transacting: t});
        });
    });
  })
  .catch(function (err) {
    console.error(err);
  });
}

