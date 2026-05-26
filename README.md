# IMDB Map

Pick a film and see the cloud of every other movie its cast has been in — and
play *Six Degrees* between any two films.

A curated corpus of ~240 films and ~600 actors (Nolan, Tarantino, Scorsese, the
Coens, Wes Anderson, MCU, LOTR/Hobbit, Bond, A24, Pixar, Linklater, Apatow…)
is bundled with the app, producing dense, navigable cast networks.

## Stack
- Next.js 15 (App Router) — Vercel deploy, no config needed
- TypeScript, Tailwind CSS
- `react-force-graph-2d` for the canvas
- `lucide-react` icons
- iOS-style glass + pill aesthetic, light theme

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Deploy

Push to a repo and import in Vercel — no config required. The whole graph runs
client-side from a bundled dataset; no API keys.
