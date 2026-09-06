import { Solver } from './index.js';

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

export async function buildPhrase(depth = 15) {
  const solver = new Solver();
  const phrase = [];
  try {
    for (let i = 0; i < depth; i++) {
      let rows = [];
      if (phrase.length >= 2) {
        rows = await solver.query(
          `SELECT word FROM trigram WHERE context_1 = $1 AND context_2 = $2
           ORDER BY frequency DESC LIMIT 50`,
          [phrase[phrase.length - 2], phrase[phrase.length - 1]]
        );
      }
      if (!rows.length && phrase.length >= 1) {
        rows = await solver.query(
          `SELECT word FROM trigram WHERE context_2 = $1
           ORDER BY frequency DESC LIMIT 50`,
          [phrase[phrase.length - 1]]
        );
      }
      if (!rows.length) {
        rows = await solver.query(
          `SELECT word FROM trigram ORDER BY frequency DESC LIMIT 100`
        );
      }
      if (!rows.length) break;
      phrase.push(sample(rows).word);
    }
  } finally {
    await solver.sql.end();
  }
  return phrase.join(' ');
}

if (import.meta.main) {
  buildPhrase().then(console.log).catch((err) => { console.error(err); process.exit(1); });
}
