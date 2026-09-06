import React from 'react';
import axios from 'axios';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import './app.scss';

class AppStore {
  puzzle = '';
  exclude = '';
  loading = false;
  solutions = null;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  setPuzzle(puzzle) {
    this.puzzle = puzzle;
  }

  setExclude(exclude) {
    this.exclude = exclude;
  }

  get canSolve() {
    return !this.loading && /[a-z_]/i.test(this.puzzle);
  }

  solve = async () => {
    if (!this.canSolve) return;
    this.loading = true;
    this.solutions = null;
    this.error = null;
    try {
      const params = new URLSearchParams({ puzzle: this.puzzle, exclude: this.exclude });
      const { data } = await axios.get(`/solve?${params}`);
      this.solutions = data.solutions ?? [];
    } catch (err) {
      this.error = err.response?.data?.error ?? 'Solver unavailable — is the database running?';
    } finally {
      this.loading = false;
    }
  };
}

const store = new AppStore();

const KEY_HINTS = `Use '_' for unknown letters and fill in any letters you've already
guessed. List letters you know are NOT in the puzzle under excluded.`;

function App() {
  const onSubmit = (e) => {
    e.preventDefault();
    store.solve();
  };

  return (
    <div className="app">
      <header className="header">Phrase Solver</header>
      <div className="content">
        <form className="inputs" onSubmit={onSubmit}>
          <label>
            Puzzle
            <input
              placeholder="t__g_ __r___t"
              spellCheck={false}
              value={store.puzzle}
              onChange={(e) => store.setPuzzle(e.target.value)}
            />
          </label>
          <label>
            Excluded letters
            <input
              placeholder="rstlnemp"
              spellCheck={false}
              value={store.exclude}
              onChange={(e) => store.setExclude(e.target.value)}
            />
          </label>
          <button className="solve" type="submit" disabled={!store.canSolve}>
            {store.loading ? 'Solving…' : 'Solve'}
          </button>
          <p className="hints">{KEY_HINTS}</p>
        </form>

        <div className="solutions">
          {store.error && <div className="error">{store.error}</div>}
          {store.solutions && (
            <>
              <h2>Possible Solutions:</h2>
              {store.solutions.length ? (
                <ol>
                  {store.solutions.map((solution, i) => (
                    <li key={`${solution}-${i}`}>{solution}</li>
                  ))}
                </ol>
              ) : (
                <p>No matches — check the puzzle and excluded letters.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default observer(App);
