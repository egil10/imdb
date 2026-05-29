"use client";

import { useEffect, useState } from "react";

export type Movie = {
  id: string; // IMDb tconst, e.g. "tt0468569"
  title: string;
  year: number;
  rating: number; // 0-10
  votes: number;
  genres: string; // comma-separated
  cast: string[]; // nconst ids
};

export type Actor = { id: string; name: string };

export type Dataset = {
  movies: Movie[];
  actors: Actor[];
  moviesById: Record<string, Movie>;
  actorNamesById: Record<string, string>;
  filmography: Record<string, string[]>; // actor id -> movie ids, sorted by votes desc
  // Largest connected component of the bipartite movie-actor graph.
  // ~95.7% of all movies live here; the rest are foreign-cinema islands.
  mainComponent: Set<string>; // movie ids in the giant component
  mainComponentActors: Set<string>; // actor ids in the giant component
  // List forms for cheap random sampling.
  mainComponentMovies: Movie[];
  mainComponentActorList: Actor[];
};

let cache: Dataset | null = null;
let inflight: Promise<Dataset> | null = null;

// Hue bands reserved for node *roles*, so a film's colour can never be confused
// with the focal node (violet) or an actor (amber). Genre + hash hues steer
// clear of these.
const RESERVED_HUE_BANDS: [number, number][] = [
  [28, 52], // amber — actors
  [258, 288], // violet — focal / central
];

function inReservedBand(h: number): boolean {
  return RESERVED_HUE_BANDS.some(([a, b]) => h >= a && h <= b);
}

function deriveHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  h = h % 360;
  // Nudge out of the reserved role bands so unknown-genre films stay visually
  // distinct from focal/actor nodes.
  let guard = 0;
  while (inReservedBand(h) && guard++ < 24) h = (h + 19) % 360;
  return h;
}

// Main-genre → hue band, so the graph reads visually by genre. Exported so the
// on-map legend renders the exact same colours as the nodes.
export const GENRE_HUES: Record<string, number> = {
  action: 0,
  adventure: 18,
  animation: 320,
  biography: 200,
  comedy: 54, // out of the amber band
  crime: 220,
  documentary: 180,
  drama: 246, // out of the violet band
  family: 296,
  fantasy: 310,
  history: 24,
  horror: 350,
  music: 62,
  musical: 84,
  mystery: 234,
  romance: 332,
  "sci-fi": 192,
  sport: 108,
  thriller: 252,
  war: 8,
  western: 26,
};

// Turn a hue into the exact fill the canvas uses for a film node.
export function colorForHue(hue: number): string {
  return `hsl(${hue} 65% 58%)`;
}

export function hueFor(movie: { id: string; genres?: string; title: string }): number {
  if (movie.genres) {
    const g = movie.genres.split(",")[0].toLowerCase();
    if (GENRE_HUES[g] !== undefined) return GENRE_HUES[g];
  }
  return deriveHue(movie.id || movie.title);
}

async function fetchDataset(): Promise<Dataset> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const res = await fetch("/imdb.json", { cache: "force-cache" });
    if (!res.ok) throw new Error(`Failed to load dataset: ${res.status}`);
    const raw = (await res.json()) as { movies: Movie[]; actors: Actor[] };

    const moviesById: Record<string, Movie> = Object.create(null);
    for (const m of raw.movies) moviesById[m.id] = m;

    const actorNamesById: Record<string, string> = Object.create(null);
    for (const a of raw.actors) actorNamesById[a.id] = a.name;

    const filmography: Record<string, string[]> = Object.create(null);
    for (const m of raw.movies) {
      for (const aid of m.cast) (filmography[aid] ||= []).push(m.id);
    }
    // sort each actor's filmography by votes descending so most popular shows first
    for (const aid in filmography) {
      filmography[aid].sort((a, b) => moviesById[b].votes - moviesById[a].votes);
    }

    const { mainComponent, mainComponentActors } = computeMainComponent(
      raw.movies,
      filmography,
    );
    const mainComponentMovies = raw.movies.filter((m) => mainComponent.has(m.id));
    const mainComponentActorList = raw.actors.filter((a) =>
      mainComponentActors.has(a.id),
    );

    cache = {
      movies: raw.movies,
      actors: raw.actors,
      moviesById,
      actorNamesById,
      filmography,
      mainComponent,
      mainComponentActors,
      mainComponentMovies,
      mainComponentActorList,
    };
    return cache;
  })();
  return inflight;
}

export function useDataset(): Dataset | null {
  const [d, setD] = useState<Dataset | null>(cache);
  useEffect(() => {
    if (cache) {
      setD(cache);
      return;
    }
    let active = true;
    fetchDataset().then((ds) => {
      if (active) setD(ds);
    });
    return () => {
      active = false;
    };
  }, []);
  return d;
}

export function pickRandomMovie(
  d: Dataset,
  exclude?: string,
  opts?: { mainOnly?: boolean },
): Movie {
  const pool = opts?.mainOnly ? d.mainComponentMovies : d.movies;
  let m: Movie;
  do {
    m = pool[Math.floor(Math.random() * pool.length)];
  } while (exclude && m.id === exclude);
  return m;
}

// Sample an actor from the giant component (so an actor↔actor path is
// guaranteed to exist). Optionally require a minimum filmography so the puzzle
// has room to breathe.
export function pickRandomActor(
  d: Dataset,
  exclude?: string,
  minFilms = 2,
): Actor {
  const pool = d.mainComponentActorList;
  let a: Actor;
  let guard = 0;
  do {
    a = pool[Math.floor(Math.random() * pool.length)];
    guard++;
  } while (
    guard < 50 &&
    ((exclude && a.id === exclude) ||
      (d.filmography[a.id]?.length ?? 0) < minFilms)
  );
  return a;
}

// One BFS over the bipartite graph to find the largest connected component.
// Runs once at dataset load (~80k nodes, completes in milliseconds).
function computeMainComponent(
  movies: Movie[],
  filmography: Record<string, string[]>,
): { mainComponent: Set<string>; mainComponentActors: Set<string> } {
  /** @type {Map<string, string[]>} */
  const adj: Record<string, string[]> = Object.create(null);
  for (const m of movies) {
    const mid = "m:" + m.id;
    (adj[mid] ||= []);
    for (const a of m.cast) {
      const aid = "a:" + a;
      (adj[mid] ||= []).push(aid);
      (adj[aid] ||= []).push(mid);
    }
  }

  const seen = new Set<string>();
  let best: { ids: Set<string>; size: number } | null = null;

  for (const start in adj) {
    if (seen.has(start)) continue;
    const ids = new Set<string>();
    // Use a head pointer instead of Array.shift() (which is O(n)) so the whole
    // ~97k-node scan stays linear rather than quadratic.
    const queue: string[] = [start];
    let head = 0;
    seen.add(start);
    while (head < queue.length) {
      const n = queue[head++];
      ids.add(n);
      const nb = adj[n];
      if (!nb) continue;
      for (const x of nb) {
        if (!seen.has(x)) {
          seen.add(x);
          queue.push(x);
        }
      }
    }
    if (!best || ids.size > best.size) best = { ids, size: ids.size };
  }

  const mainComponent = new Set<string>();
  const mainComponentActors = new Set<string>();
  if (best) {
    for (const nid of best.ids) {
      if (nid.startsWith("m:")) mainComponent.add(nid.slice(2));
      else mainComponentActors.add(nid.slice(2));
    }
  }
  return { mainComponent, mainComponentActors };
}
