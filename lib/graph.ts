import type { Dataset } from "./dataset";

export type GraphNode = {
  id: string;
  type: "movie" | "actor";
  label: string;
  year?: number;
  hue?: number;
  // Popularity weight — used by NetworkGraph to scale node radius.
  // For movies: log10(votes). For actors: log10(filmography size).
  weight?: number;
};

export type GraphLink = { source: string; target: string };
export type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

// Cap how many of an actor's other films we surface in a focal-movie graph.
// IMDb veterans like Samuel L. Jackson have 100+ entries — without a cap, one
// focal film can explode the graph into hundreds of nodes.
const MAX_OTHER_FILMS_PER_ACTOR = 8;

import { hueFor } from "./dataset";

// Map raw popularity to a 0..1 "weight" the renderer uses for node radius.
// votes ranges from ~5k to ~3M, so log10(votes) ranges ~3.7 to ~6.5 — we
// rescale that to 0..1 so the smallest dot is still visible.
function weightForVotes(votes: number): number {
  const v = Math.max(1, votes || 1);
  const x = (Math.log10(v) - 3.5) / (6.5 - 3.5);
  return Math.max(0, Math.min(1, x));
}
function weightForActorFilms(count: number): number {
  if (count <= 1) return 0;
  const x = (Math.log10(count) - 0) / (Math.log10(100) - 0);
  return Math.max(0, Math.min(1, x));
}

export function buildMovieGraph(d: Dataset, movieId: string): GraphData {
  const focal = d.moviesById[movieId];
  if (!focal) return { nodes: [], links: [] };

  const nodes = new Map<string, GraphNode>();
  const links: GraphLink[] = [];
  const seenLinks = new Set<string>();

  const addNode = (n: GraphNode) => {
    if (!nodes.has(n.id)) nodes.set(n.id, n);
  };
  const addLink = (a: string, b: string) => {
    const k = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seenLinks.has(k)) return;
    seenLinks.add(k);
    links.push({ source: a, target: b });
  };

  addNode({
    id: `movie:${focal.id}`,
    type: "movie",
    label: focal.title,
    year: focal.year,
    hue: hueFor(focal),
    weight: weightForVotes(focal.votes),
  });

  for (const actorId of focal.cast) {
    const actorNodeId = `actor:${actorId}`;
    const filmCount = (d.filmography[actorId] || []).length;
    addNode({
      id: actorNodeId,
      type: "actor",
      label: d.actorNamesById[actorId] || actorId,
      weight: weightForActorFilms(filmCount),
    });
    addLink(`movie:${focal.id}`, actorNodeId);

    const films = (d.filmography[actorId] || []).filter((mid) => mid !== focal.id);
    for (const mid of films.slice(0, MAX_OTHER_FILMS_PER_ACTOR)) {
      const m = d.moviesById[mid];
      if (!m) continue;
      const mNodeId = `movie:${m.id}`;
      addNode({
        id: mNodeId,
        type: "movie",
        label: m.title,
        year: m.year,
        hue: hueFor(m),
        weight: weightForVotes(m.votes),
      });
      addLink(actorNodeId, mNodeId);
    }
  }

  return { nodes: Array.from(nodes.values()), links };
}

export type PathStep =
  | { type: "movie"; id: string; title: string; year: number }
  | { type: "actor"; id: string; name: string };

export function findPath(d: Dataset, fromId: string, toId: string): PathStep[] | null {
  if (fromId === toId) {
    const m = d.moviesById[fromId];
    return m ? [{ type: "movie", id: m.id, title: m.title, year: m.year }] : null;
  }
  if (!d.moviesById[fromId] || !d.moviesById[toId]) return null;

  const start = `m:${fromId}`;
  const goal = `m:${toId}`;
  const prev = new Map<string, string | null>();
  prev.set(start, null);

  const queue: string[] = [start];
  while (queue.length) {
    const node = queue.shift()!;
    if (node === goal) break;
    if (node.startsWith("m:")) {
      const movie = d.moviesById[node.slice(2)];
      if (!movie) continue;
      for (const aid of movie.cast) {
        const next = `a:${aid}`;
        if (!prev.has(next)) {
          prev.set(next, node);
          queue.push(next);
        }
      }
    } else {
      const aid = node.slice(2);
      for (const mid of d.filmography[aid] || []) {
        const next = `m:${mid}`;
        if (!prev.has(next)) {
          prev.set(next, node);
          queue.push(next);
          if (next === goal) {
            queue.length = 0;
            break;
          }
        }
      }
    }
  }
  if (!prev.has(goal)) return null;

  const chain: string[] = [];
  let cur: string | null = goal;
  while (cur) {
    chain.unshift(cur);
    cur = prev.get(cur) ?? null;
  }

  return chain.map((nid): PathStep => {
    if (nid.startsWith("m:")) {
      const m = d.moviesById[nid.slice(2)]!;
      return { type: "movie", id: m.id, title: m.title, year: m.year };
    }
    const aid = nid.slice(2);
    return { type: "actor", id: aid, name: d.actorNamesById[aid] || aid };
  });
}
