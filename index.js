const MAX_CANDIDATES_PER_WORD = 25;
const MAX_SOLUTIONS = 30;
const MAX_WORDS = 24;
const MAX_WORD_LENGTH = 24;

const dbConfig = {
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5433),
  user: process.env.PGUSER || 'phrase_solver',
  password: process.env.PGPASSWORD || 'phrase_solver',
  database: process.env.PGDATABASE || 'phrase_solver',
};

function knownLetters(puzzle, exclude) {
  const known = new Set(puzzle.match(/[a-z]/g) || []);
  for (const c of (exclude.toLowerCase().match(/[a-z]/g) || [])) known.add(c);
  return [...known];
}

function escapeForRegex(ch) {
  return /[.[\](){}*+?|^$\\]/.test(ch) ? `\\${ch}` : ch;
}

function blankClass(known) {
  return known.length
    ? `[^${known.map(escapeForRegex).join('')}\\s]`
    : '[a-z\\s]';
}

function wordToRegex(word, known) {
  const classes = blankClass(known);
  return word
    .split('')
    .map((c) => (/[a-zA-Z]/.test(c) ? escapeForRegex(c.toLowerCase()) : classes))
    .join('');
}

// Merge two ranked candidate lists into the best `limit` composites, scoring
// each as the sum of its parts' frequencies.
function mergeRanked(listA, listB, limit) {
  if (!listA.length) return listB.slice(0, limit);
  if (!listB.length) return listA.slice(0, limit);
  const merged = [];
  for (const a of listA) {
    for (const b of listB) {
      merged.push({ words: a.words.concat(b.words), score: a.score + b.score });
      // Both lists are frequency-sorted, so the worst case for any `a` only
      // gets worse as `b` walks down the list.
      if (merged.length >= limit * 4 && merged[merged.length - 1].score >= a.score + b.score) break;
    }
  }
  merged.sort((x, y) => y.score - x.score);
  return merged.slice(0, limit);
}

export class Solver {
  constructor(config = {}) {
    this.sql = new Bun.SQL({ ...dbConfig, ...config });
    this.connected = false;
    this.connecting = null;
  }

  async connectWithRetry(tries = 10) {
    if (this.connected) return;
    if (!this.connecting) {
      this.connecting = (async () => {
        for (let attempt = 1; attempt <= tries; attempt++) {
          try {
            await this.sql`SELECT 1`;
            this.connected = true;
            console.log('Connected to db!');
            return;
          } catch (err) {
            console.log(`Database not ready (attempt ${attempt}/${tries}): ${err.message}`);
            if (attempt === tries) {
              this.connecting = null;
              throw new Error(`Could not connect to DB after ${tries} tries`);
            }
            await Bun.sleep(1000);
          }
        }
      })();
    }
    return this.connecting;
  }

  async query(text, values) {
    await this.connectWithRetry();
    return this.sql.unsafe(text, values);
  }

  async candidatesFor(word, regex, known) {
    const hasLetter = /[a-z]/i.test(word);
    if (!hasLetter && word === '_') {
      const stopWords = ['a', 'i'].filter((w) => !known.includes(w));
      return stopWords.map((w) => ({ words: [w], score: 0 }));
    }
    const rows = await this.query(
      `SELECT word, frequency FROM unigram
       WHERE word ~ $1
       ORDER BY frequency DESC
       LIMIT $2`,
      [`^${regex}$`, MAX_CANDIDATES_PER_WORD]
    );
    return rows
      .filter(({ word }) => /^[a-z]+$/.test(word))
      .map(({ word, frequency }) => ({ words: [word], score: frequency }));
  }

  async solve(puzzle, exclude = '') {
    if (typeof puzzle !== 'string') throw new Error('Puzzle must be a string');
    puzzle = puzzle.toLowerCase().trim().replace(/\s+/g, ' ');
    if (!puzzle) throw new Error('Puzzle is empty');

    const words = puzzle.split(' ');
    if (words.length > MAX_WORDS) {
      throw new Error(`Puzzle too long (max ${MAX_WORDS} words)`);
    }
    const tooLong = words.find((w) => w.length > MAX_WORD_LENGTH);
    if (tooLong) throw new Error(`Word too long: "${tooLong}"`);

    const known = knownLetters(puzzle, String(exclude || ''));
    const regexParts = words.map((w) => wordToRegex(w, known));

    let best = [];
    for (let i = 0; i < words.length; i++) {
      const candidates = await this.candidatesFor(words[i], regexParts[i], known);
      if (!candidates.length) {
        best = mergeRanked(best, [{ words: ['?'], score: 0 }], MAX_SOLUTIONS);
      } else {
        best = mergeRanked(best, candidates, MAX_SOLUTIONS);
      }
    }

    const seen = new Set();
    const solutions = [];
    for (const row of best) {
      const line = row.words.join(' ');
      if (!seen.has(line)) {
        seen.add(line);
        solutions.push(line);
      }
      if (solutions.length >= MAX_SOLUTIONS) break;
    }
    return solutions;
  }
}

const defaultSolver = new Solver();

export const solve = (puzzle, exclude) => defaultSolver.solve(puzzle, exclude);
export default { solve, Solver };
