const express = require('express');
const app = express();
const { solve } = require('../index');

// respond with "hello world" when a GET request is made to the homepage
app.get('/solve', async (req, res) => {
  const { puzzle = '', exclude = '' } = req.query;

  console.log(`puzzle, exclude`, puzzle, exclude);

  const solutions = await solve(puzzle, exclude);
  res.json({solutions});
})

app.listen(3002, () => console.log('Listening on port 3002'));
