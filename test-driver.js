'use strict';

const fs = require('fs');
let changeset = JSON.parse(fs.readFileSync('./test/fixtures/example.json'));
let Worker = require('./index');
Worker = new (Worker);

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let userId = 12;

userId = userId || 100 + getRandomInt(0, 4);
changeset.metadata.id = getRandomInt(0, 999);
changeset.metadata.uid = userId;
changeset.metadata.user = 'Tracer-' + String(userId);
changeset.metadata.comment = '#hotosm-project-' + String(getRandomInt(0, 4));

Worker.addToDB(changeset);
