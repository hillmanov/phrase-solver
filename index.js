const _ = require('lodash');
const Promise = require('bluebird');
const { Client } = require('pg');
const db = new Client({
  user: 'phrase_solver',
  host: 'localhost',
  database: 'phrase_solver',
  password: 'phrase_solver',
  port: 5433,
});

let connected = false;
async function connectWithRetry(tries = 0) {
  if (connected) {
    return;
  }
  if (tries >= 10) {
    throw new Error(`Could not connect to DB after ${tries} tries`);
  }
  try {
    await db.connect();
    connected = true;
    console.log(`Connected to db!`);
  } catch(err) {
    console.log(`Database not ready...`);
    return Promise.delay(1000, () => connectWithRetry(tries +1));
  }
}

async function solve(puzzle, exclude = '') {
  await connectWithRetry();
  return new Promise((resolve, reject) => {
    const letters = _.uniq((puzzle + exclude).match(/[a-zA-Z]/mg))
    const regex = puzzle.replace(/_/g, '[^' + letters.join('') + ']')
    const regexParts = regex.split(' ');
    const numberOfWords = regexParts.length;
    const weightedWordPositions = _.times(numberOfWords, () => []); // Create array of arrays

    let currentWordIndex = 0;

    async function solveLoop({ skipTrigram = false, skipBigram = false }) {
      // console.log('solving...', currentWordIndex);
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
        let trigramQuery = _.map(regexParts.slice(currentWordIndex, currentWordIndex + 3), w => `^${w}$`);

        // console.log(`trigramQuery:`, trigramQuery);
        // console.log(`\n\n\n`);
        const { rows: trigrams } = await db.query({
          text: `
            SELECT context_1, context_2, word
            FROM trigram
            WHERE context_1 ~ $1
            AND context_2 ~ $2
            AND word ~ $3
            ORDER BY frequency DESC
            LIMIT 5
        `, 
          values: trigramQuery,
          rowMode: 'array'
        });

        // console.log('trigrams', trigrams);

        if (trigrams.length) {
          _.each(trigrams, trigram => {
            _.each(_.values(trigram), (part, trigramWordIndex) => {
              weightedWordPositions[currentWordIndex + trigramWordIndex].push(part);
            });
          });
          currentWordIndex += 1;
          solveLoop({ skipTrigram: false, skipBigram: false });
        }
        else {
          solveLoop({ skipTrigram: true, skipBigram: false });
        }
      }

      else if (currentWordIndex + 2 <= numberOfWords && !skipBigram) {
        let bigramQuery = _.map(regexParts.slice(currentWordIndex, currentWordIndex + 2), w => `^${w}$`);
        // console.log(`bigramQuery`, bigramQuery);
        const { rows: bigrams } = await db.query({
          text: `
            SELECT context, word
            FROM bigram
            WHERE context ~ $1
            AND word ~ $2
            ORDER BY frequency DESC
            LIMIT 5
          `, 
          values: bigramQuery,
          rowMode: 'array'
        });

        // console.log('bigrams', bigrams);

        if (bigrams.length) {
          _.each(bigrams, bigram => {
            _.each(_.values(bigram), (part, birgramWordIndex) => {
              weightedWordPositions[currentWordIndex + birgramWordIndex].push(part);
            });
          });
          currentWordIndex += 1;
          solveLoop({ skipTrigram: false, skipBigram: false });
        }
        else {
          solveLoop({ skipTrigram: true, skipBigram: true });
        }
      }

      else if (currentWordIndex + 1 <= numberOfWords) {
        let unigramQuery = `^${regexParts[currentWordIndex]}$`;
        const { rows: unigrams } = await db.query({
          text: `
            SELECT word
            FROM unigram
            WHERE word ~ $1
            ORDER BY frequency DESC
            LIMIT 5
          `, 
          values: [unigramQuery],
          rowMode: 'array'}
        );
        // console.log('unigrams', unigrams);
        if (unigrams.length) {
          _.each(unigrams, unigram => {
            _.each(_.values(unigram), (part, unigramWordIndex) => {
              weightedWordPositions[currentWordIndex + unigramWordIndex].push(part);
            });
          });
        }
        currentWordIndex += 1;
        solveLoop({ skipTrigram: false, skipBigram: false });
      }
    }
    solveLoop({});
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
