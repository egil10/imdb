# IMDB Map

Pick a film and see the cloud of every other movie its cast has been in — and
play *Six Degrees* between any two films.

Bundled with **6,000 films and ~27,000 actors** built directly from the official
[IMDb non-commercial datasets](https://developer.imdb.com/non-commercial-datasets/),
filtered to titles with ≥ 25,000 votes for a dense, recognisable network.

## Stack
- Next.js 15 (App Router) — Vercel deploy, no config needed
- TypeScript, Tailwind CSS
- `react-force-graph-2d` for the canvas
- `lucide-react` icons
- iOS-style glass + pill aesthetic, light theme
- Dataset loaded on demand from `/imdb.json` (~2.5 MB, cached after first visit)

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
```

## Rebuild the dataset

```bash
node scripts/build-dataset.mjs
```

Downloads ~1.3 GB of `title.basics.tsv.gz`, `title.ratings.tsv.gz`,
`title.principals.tsv.gz` and `name.basics.tsv.gz` to `.cache/` (gitignored),
streams them, and writes a filtered `public/imdb.json`. Tunables at the top
of the script: `MIN_VOTES`, `MAX_MOVIES`, `MAX_CAST`.

## Deploy

Push to a repo and import in Vercel — no config required.
