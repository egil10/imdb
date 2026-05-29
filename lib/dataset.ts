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
  // List form for cheap random sampling.
  mainComponentMovies: Movie[];
};

let cache: Dataset | null = null;
let inflight: Promise<Dataset> | null = null;

function deriveHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function hueFor(movie: { id: string; genres?: string; title: string }): number {
  if (movie.genres) {
    // map main genre to a hue band so the graph reads visually
    const g = movie.genres.split(",")[0].toLowerCase();
    const map: Record<string, number> = {
      action: 0,
      adventure: 20,
      animation: 320,
      biography: 200,
      comedy: 45,
      crime: 220,
      documentary: 180,
      drama: 260,
      family: 290,
      fantasy: 310,
      history: 30,
      horror: 350,
      music: 60,
      musical: 80,
      mystery: 240,
      romance: 330,
      "sci-fi": 195,
      sport: 100,
      thriller: 250,
      war: 10,
      western: 25,
    };
    if (map[g] !== undefined) return map[g];
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

    const { mainComponent, mainComponentMovies } = computeMainComponent(
      raw.movies,
      filmography,
    );

    cache = {
      movies: raw.movies,
      actors: raw.actors,
      moviesById,
      actorNamesById,
      filmography,
      mainComponent,
      mainComponentMovies,
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

// One BFS over the bipartite graph to find the largest connected component.
// Runs once at dataset load (~80k nodes, completes in milliseconds).
function computeMainComponent(
  movies: Movie[],
  filmography: Record<string, string[]>,
): { mainComponent: Set<string>; mainComponentMovies: Movie[] } {
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
  if (best) {
    for (const nid of best.ids) {
      if (nid.startsWith("m:")) mainComponent.add(nid.slice(2));
    }
  }
  const mainComponentMovies = movies.filter((m) => mainComponent.has(m.id));
  return { mainComponent, mainComponentMovies };
}
