'use strict';
const _        = require('lodash');
const sqlite3  = require('sqlite3');
const db       = new sqlite3.Database(__dirname + '/db.sqlite');

function solve(puzzle, options) {
  options = _.defaults(options, { exclude: '' });
  return new Promise((resolve, reject) => {
    const letters               = _.uniq((puzzle + options.exclude).match(/[a-zA-Z]/mg))
    const regex                 = puzzle.replace(/_/g, '[^' + letters.join('') + ']')
    const regexParts            = regex.split(' ');
    const numberOfWords         = regexParts.length;
    const weightedWordPositions = _.times(numberOfWords, () => []); // Create array of arrays

    let currentWordIndex      = 0;
    let skipTrigram           = false;
    let skipBigram            = false;

    function solveLoop() {
      let trigram;
      let bigram;
      let unigram;

      if (currentWordIndex === numberOfWords) {
        let fullResultSet    = cartesianProductOf.apply(null, weightedWordPositions);
        let dedupedResultSet = _(fullResultSet)
                                .map(row => row.join(' '))
                                .uniq()
                                .take(30)
                                .value();

        return resolve(dedupedResultSet);
      }
      if (currentWordIndex + 3 <= numberOfWords && !skipTrigram) {
        let trigramQuery = regexParts.slice(currentWordIndex, currentWordIndex + 3);
        db.all(
          `SELECT context_1, context_2, word
           FROM trigram
           WHERE context_1 GLOB ?
           AND context_2 GLOB ?
           AND word GLOB ?
           ORDER BY frequency DESC
           LIMIT 5`,
          trigramQuery,
          (err, trigrams) => {
            if (trigrams.length) {
              _.each(trigrams, trigram => {
                _.each(_.values(trigram), (part, trigramWordIndex) => {
                  weightedWordPositions[currentWordIndex + trigramWordIndex].push(part);
                });
              });
              currentWordIndex += 1;
              skipTrigram = false;
              skipBigram  = false;
              solveLoop();
            }
            else {
              skipTrigram = true;
              solveLoop();
            }
          }
        );
      }


      else if (currentWordIndex + 2 <= numberOfWords && !skipBigram) {
        let bigramQuery = regexParts.slice(currentWordIndex, currentWordIndex + 2);
        db.all(
          `SELECT context, word
           FROM bigram
           WHERE context GLOB ?
           AND word GLOB ?
           ORDER BY frequency DESC
           LIMIT 5`,
          bigramQuery,
          (err, bigrams) => {
            if (bigrams.length) {
              _.each(bigrams, bigram => {
                _.each(_.values(bigram), (part, birgramWordIndex) => {
                  weightedWordPositions[currentWordIndex + birgramWordIndex].push(part);
                });
              });
              currentWordIndex += 1;
              skipTrigram = false;
              skipBigram  = false;
              solveLoop();
            }
            else {
              skipBigram = true;
              solveLoop();
            }
          }
        );
      }

      else if (currentWordIndex + 1 <= numberOfWords) {
        let unigramQuery = regexParts[currentWordIndex];
        db.all(
          `SELECT word
           FROM unigram
           WHERE word GLOB ?
           ORDER BY frequency DESC
           LIMIT 5`,
          unigramQuery,
          (err, unigrams) => {
            if (unigrams.length) {
              _.each(unigrams, unigram => {
                _.each(_.values(unigram), (part, unigramWordIndex) => {
                  weightedWordPositions[currentWordIndex + unigramWordIndex].push(part);
                });
              });
              currentWordIndex += 1;
              skipTrigram       = false;
              skipBigram        = false;
              solveLoop();
            }
            else {
              skipTrigram       = false;
              skipBigram        = false;
              currentWordIndex += 1;
              solveLoop();
            }
          }
        );
      }
      skipTrigram = false;
      skipBigram  = false;
    }
    solveLoop();
  });
}

function cartesianProductOf() {
    return _.reduce(arguments, (a, b) => {
        return _.flatten(_.map(a, x => {
            return _.map(b, y => {
                return x.concat([y]);
            });
        }), true);
    }, [ [] ]);
};

// solve('t__g_ __r___t', { exclude: 'rstlnempcag'})

module.exports = {
  solve
};
