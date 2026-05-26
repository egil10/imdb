#!/usr/bin/env node
// Audit how connected the bundled IMDb graph actually is.
//
// We build the bipartite movie–actor graph from public/imdb.json and run a
// flood-fill to find connected components. Reports:
//   - total movies / actors
//   - number of components
//   - size of the largest component (movies + actors)
//   - % of movies that sit inside the largest component
//   - the top isolated "islands" (small components)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const raw = JSON.parse(readFileSync(resolve("./public/imdb.json"), "utf8"));
const movies = raw.movies;
const actors = raw.actors;

console.log(`Movies: ${movies.length.toLocaleString()}`);
console.log(`Actors: ${actors.length.toLocaleString()}`);

// Build adjacency: each node id is prefixed m:<tconst> or a:<nconst>.
/** @type {Map<string, string[]>} */
const adj = new Map();
const addEdge = (a, b) => {
  let la = adj.get(a);
  if (!la) adj.set(a, (la = []));
  la.push(b);
  let lb = adj.get(b);
  if (!lb) adj.set(b, (lb = []));
  lb.push(a);
};
for (const m of movies) {
  const mid = `m:${m.id}`;
  if (!adj.has(mid)) adj.set(mid, []);
  for (const aid of m.cast) addEdge(mid, `a:${aid}`);
}

// Flood fill via iterative BFS to enumerate components.
const seen = new Set();
const components = [];
for (const start of adj.keys()) {
  if (seen.has(start)) continue;
  const queue = [start];
  seen.add(start);
  let movieCount = 0;
  let actorCount = 0;
  const sampleMovies = [];
  while (queue.length) {
    const n = queue.shift();
    if (n.startsWith("m:")) {
      movieCount++;
      if (sampleMovies.length < 4) sampleMovies.push(n.slice(2));
    } else actorCount++;
    for (const nb of adj.get(n) || []) {
      if (!seen.has(nb)) {
        seen.add(nb);
        queue.push(nb);
      }
    }
  }
  components.push({ movieCount, actorCount, sampleMovies });
}

components.sort((a, b) => b.movieCount - a.movieCount);
const total = movies.length;
const biggest = components[0];

console.log(`\nConnected components: ${components.length.toLocaleString()}`);
console.log(
  `Largest component: ${biggest.movieCount.toLocaleString()} movies + ${biggest.actorCount.toLocaleString()} actors`,
);
console.log(
  `  → ${((biggest.movieCount / total) * 100).toFixed(2)}% of all movies in dataset`,
);

const titleOf = (tconst) => {
  const m = movies.find((mv) => mv.id === tconst);
  return m ? `${m.title} (${m.year})` : tconst;
};

const islands = components.slice(1, 11);
if (islands.length) {
  console.log(`\nNext 10 components (islands):`);
  for (const c of islands) {
    console.log(
      `  ${c.movieCount} movies / ${c.actorCount} actors — sample: ${c.sampleMovies
        .map(titleOf)
        .join(", ")}`,
    );
  }
}

// How many movie–movie pairs are reachable?
const totalPairs = (total * (total - 1)) / 2;
const reachablePairs = components.reduce(
  (acc, c) => acc + (c.movieCount * (c.movieCount - 1)) / 2,
  0,
);
const pct = (reachablePairs / totalPairs) * 100;
console.log(
  `\nReachable movie-pair fraction: ${pct.toFixed(4)}% (${reachablePairs.toLocaleString()} of ${totalPairs.toLocaleString()})`,
);
