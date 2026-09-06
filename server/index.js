import path from 'path';
import { fileURLToPath } from 'url';
import { solve } from '../index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../client/dist');
const PORT = Number(process.env.PORT || 3002);

async function handleSolve(url) {
  const puzzle = url.searchParams.get('puzzle') ?? '';
  const exclude = url.searchParams.get('exclude') ?? '';
  try {
    const solutions = await solve(String(puzzle), String(exclude));
    return Response.json({ solutions });
  } catch (err) {
    const badInput = /puzzle|too long|empty/i.test(err.message);
    return Response.json({ error: err.message }, { status: badInput ? 400 : 500 });
  }
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/solve') {
      if (req.method !== 'GET') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
      }
      return handleSolve(url);
    }

    const filePath = path.resolve(DIST, '.' + url.pathname);
    if (filePath.startsWith(DIST + path.sep)) {
      const file = Bun.file(filePath);
      if (await file.exists()) return new Response(file);
    }

    const index = Bun.file(path.join(DIST, 'index.html'));
    if (await index.exists()) return new Response(index);
    return new Response('Client not built — run `make build`', { status: 503 });
  },
});

console.log(`Listening on port ${server.port}`);
