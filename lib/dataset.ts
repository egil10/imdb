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

    cache = { movies: raw.movies, actors: raw.actors, moviesById, actorNamesById, filmography };
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

export function pickRandomMovie(d: Dataset, exclude?: string): Movie {
  let m: Movie;
  do {
    m = d.movies[Math.floor(Math.random() * d.movies.length)];
  } while (exclude && m.id === exclude);
  return m;
}
