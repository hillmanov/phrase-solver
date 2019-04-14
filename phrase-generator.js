const _        = require('lodash');
const sqlite3  = require('sqlite3');
const db = new sqlite3.Database(__dirname + '/db.sqlite');

function buildPhrase(phrase = [], depth = 0, cb) {
  console.log('phrase, depth', phrase, depth);
  if (depth === 15) {
    return cb(null, phrase.join(' '));
  }
  if (phrase.length === 0) {
    db.all(`SELECT * FROM trigram
           ORDER BY frequency DESC
           LIMIT 100`, (err, trigrams) => {
             const chosen = _.sample(trigrams);
             phrase = getPhrase(chosen);
             return buildPhrase(phrase, depth + 1, cb);
           });
  } else {
    db.all(`SELECT * FROM trigram
            WHERE context_1 = '${_.last(phrase)}'
           ORDER BY frequency DESC
           LIMIT 100`, (err, trigrams) => {
             const chosen = _.sample(trigrams);
             console.log('Chosen', chosen);
             phrase.push(..._.takeRight(getPhrase(chosen), 2));
             console.log('Built', phrase);
             return buildPhrase(phrase, depth + 1, cb);
           });
  }
}

function getPhrase(trigram) {
  return [trigram.context_1, trigram.context_2, trigram.word];

}

buildPhrase([], 0, (err, phrase) => {
  console.log(phrase);
});
