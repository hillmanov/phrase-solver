import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
module.exports = {
  apps: [{
    name: 'Phrase Solver - DB',
    cwd: __dirname,
    script: 'docker compose -f compose.local.yaml up -d db',
    interpreter: 'none',
    watch: false,
  }, {
    name: 'Phrase Solver - Server',
    script: 'bun server/index.js',
    interpreter: 'none',
    ignore_watch: ['node_modules', 'client', 'dist', '.git'],
    watch: true,
  }]
};
