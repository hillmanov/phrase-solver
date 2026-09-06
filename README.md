# phrase-solver

Solves Wheel of Fortune style puzzles (`t__g_ __r___t`, with a list of
letters known *not* to be in the puzzle) against a Postgres table of
uni/bi/trigram word frequencies mined from nltk corpora.

## Layout

- `index.js` — solver library (`solve(puzzle, exclude)`), Bun-native via `Bun.SQL`
- `server/index.js` — `Bun.serve` API on **:3002**, serves the built client
- `client/` — Vite + React 18 + mobx 6 (dev server on **:3001**, proxies `/solve`)
- `dbGenerator/` — nltk corpus → Postgres importer
- `compose.local.yaml` — Postgres 17 on host port **5433**

Runtime is [Bun](https://bun.com) (built-in HTTP server + native Postgres
driver — zero runtime npm dependencies).

## Dev

```sh
bun install
make db      # start Postgres
make run     # API :3002 + Vite :3001
```

## Prod

```sh
make build   # build client into client/dist
pm2 start pm2.config.js
```

## Regenerate the corpus DB (destructive — drops/rewrites all tables)

```sh
make regenerate-db
```
