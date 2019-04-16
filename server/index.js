const express = require('express');
const app = express();
const { solve } = require('../index');
const path = require('path');

app.use(express.static(path.join(__dirname, '../client/build')));

// respond with "hello world" when a GET request is made to the homepage
app.get('/solve', async (req, res) => {
  const { puzzle = '', exclude = '' } = req.query;
  const solutions = await solve(puzzle, exclude);
  res.json({solutions});
});


app.listen(3002, () => console.log('Listening on port 3002'));
