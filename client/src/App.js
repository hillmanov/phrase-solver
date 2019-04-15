import React, { Component } from 'react';
import './app.scss';
import { Input, Button, Form, List } from 'semantic-ui-react';
import axios from 'axios';
import { observable, computed, action, decorate } from 'mobx';
import { observer, Observer } from 'mobx-react';

class App extends Component {
  puzzle = '';
  exclude = '';
  loading = false;
  solutions = null;

  setPuzzle(puzzle) {
    this.puzzle = puzzle;
  }

  setExclude(exclude) {
    this.exclude = exclude;
  }

  setLoading(loading) {
    this.loading = loading;
  }

  setSoltuions(solutions) {
    this.solutions = solutions;
  }

  solve = async () => {
    this.setSoltuions(null);
    this.setLoading(true);
    const { data } = await axios.get(`/solve?puzzle=${this.puzzle}&exclude=${this.exclude}`);
    const { solutions } = data;
    this.setSoltuions(solutions);
    this.setLoading(false);
  }

  render() {
    return (
      <div className="app">
        <header className="header">
          Phrase Solver
        </header>
        <div className="content">

          <div className="inputs">
            <Form>
              <Observer>{() => (
                <Form.Field>
                  <label>Puzzle</label>
                  <Input placeholder='Puzzle...' value={this.puzzle} onChange={(e, { value }) => this.setPuzzle(value)} />
                </Form.Field>
              )}
              </Observer>
              <Observer>{() => (
                <Form.Field>
                  <label>Excluded letters</label>
                  <Input placeholder='Excluded Letters' value={this.exclude} onChange={(e, { value }) => this.setExclude(value)} />
                </Form.Field>
              )}
              </Observer>
            </Form>
            <Button primary onClick={this.solve}>Solve</Button>
          </div>

          <div class="solutions">
            {this.solutions && (
              <div>
                <h2>Possible Solutions:</h2>
                <List items={this.solutions} />
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }
}

decorate(App, {
  puzzle: observable,
  exclude: observable,
  loading: observable,
  solutions: observable,

  setPuzzle: action.bound,
  setExclude: action.bound,
  setLoading: action.bound,
  setSoltuions: action.bound,
});


export default observer(App);
