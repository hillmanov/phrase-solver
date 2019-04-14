const path = require('path');
module.exports = {
  apps: [{
    name: 'Phrase Solver - DB',
    script: '/usr/local/bin/docker-compose -f ./dbGenerator/docker-compose.yml up db',
    interpreter: 'none',
    watch: false,
  }, {
    name: 'Phrase Solver - Client',
    cwd: path.join(__dirname, 'client'),
    script: 'yarn start',
    interpreter: 'none',
    watch: false,
  }, {
    name: 'Phrase Solver - Server',
    script: 'server/index.js',
    ignore_watch: ['node_modules', 'client', 'build', '.git'],
    watch: true,
  }]
};
